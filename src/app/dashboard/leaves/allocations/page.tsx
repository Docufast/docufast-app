'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LeaveAllocationsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [year, setYear]             = useState(new Date().getFullYear())
  const [staff, setStaff]           = useState<any[]>([])
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [allocs, setAllocs]         = useState<Record<string, number>>({}) // key: staffId_ltId
  const [saving, setSaving]         = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!['hr_recruiter','super_admin'].includes(p?.role ?? '')) { router.push('/dashboard/leaves'); return }

      const [{ data: staffRows }, { data: ltRows }, { data: allocRows }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').order('full_name'),
        supabase.from('leave_types').select('id, name').order('name'),
        supabase.from('leave_allocations').select('staff_id, leave_type_id, total_days, used_days').eq('year', year),
      ])

      setStaff(staffRows ?? [])
      setLeaveTypes(ltRows ?? [])

      const map: Record<string, number> = {}
      for (const a of allocRows ?? []) {
        map[`${a.staff_id}_${a.leave_type_id}`] = a.total_days
      }
      setAllocs(map)
      setLoading(false)
    }
    load()
  }, [year])

  async function save(staffId: string, ltId: string, days: number) {
    const key = `${staffId}_${ltId}`
    setSaving(key)

    const { error } = await supabase
      .from('leave_allocations')
      .upsert(
        { staff_id: staffId, leave_type_id: ltId, year, total_days: days, used_days: 0 },
        { onConflict: 'staff_id,leave_type_id,year', ignoreDuplicates: false }
      )

    if (!error) setAllocs(prev => ({ ...prev, [key]: days }))
    setSaving(null)
  }

  if (loading) return <div style={{ padding:'32px', fontFamily:'Inter,system-ui,sans-serif', color:'#64748b' }}>Loading…</div>

  return (
    <div style={{ padding:'32px', fontFamily:'Inter,system-ui,sans-serif', maxWidth:'1000px' }}>
      <Link href="/dashboard/leaves" style={{ color:'#64748b', fontSize:'13px', textDecoration:'none', marginBottom:'24px', display:'inline-block' }}>
        ← Back to Leave Management
      </Link>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', marginTop:'8px' }}>
        <div>
          <h1 style={{ fontSize:'24px', fontWeight:700, color:'#0f172a', margin:0 }}>Leave Allocations</h1>
          <p style={{ color:'#64748b', fontSize:'14px', marginTop:'4px' }}>Set annual leave entitlements per staff member</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid #d1d5db', fontSize:'14px', fontFamily:'inherit', background:'white' }}
        >
          {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:'14px', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, color:'#64748b', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.05em', position:'sticky', left:0, background:'#f8fafc' }}>
                Staff
              </th>
              {leaveTypes.map(lt => (
                <th key={lt.id} style={{ padding:'12px 16px', textAlign:'center', fontWeight:600, color:'#64748b', fontSize:'12px', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                  {lt.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < staff.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding:'12px 16px', color:'#0f172a', fontWeight:500, whiteSpace:'nowrap', position:'sticky', left:0, background:'white' }}>
                  {s.full_name}
                </td>
                {leaveTypes.map(lt => {
                  const key = `${s.id}_${lt.id}`
                  const val = allocs[key] ?? ''
                  const isSaving = saving === key
                  return (
                    <td key={lt.id} style={{ padding:'8px 16px', textAlign:'center' }}>
                      <input
                        type="number"
                        min={0}
                        max={365}
                        defaultValue={val}
                        disabled={isSaving}
                        onBlur={e => {
                          const days = parseInt(e.target.value)
                          if (!isNaN(days) && days !== allocs[key]) save(s.id, lt.id, days)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                        }}
                        style={{
                          width:'64px', padding:'6px 8px', borderRadius:'6px',
                          border:'1px solid #e2e8f0', fontSize:'14px', textAlign:'center',
                          fontFamily:'inherit', background: isSaving ? '#f8fafc' : 'white',
                          outline:'none'
                        }}
                        onFocus={e => e.target.style.border = '1px solid #0260A8'}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize:'12px', color:'#94a3b8', marginTop:'12px' }}>
        Click a cell and type a number. Press Enter or click away to save.
      </p>
    </div>
  )
}
