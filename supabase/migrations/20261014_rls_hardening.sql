-- 14 Oct 2026 (#68 H4). Already applied to production and staging by hand.
-- Kept here so the database structure is in version control.

-- profiles: anon must not be able to update
revoke update on public.profiles from anon;

-- entity_members: loose insert rule removed; table is unused by the app
drop policy if exists "Users can add themselves as a member of entities they own" on public.entity_members;
revoke insert, update, delete on public.entity_members from anon, authenticated;

-- orders: users may set only these columns; status must start as quote_pending
revoke insert on public.orders from anon, authenticated;
grant insert (user_id, entity_id, service_category, order_type, status, form_data) on public.orders to authenticated;
drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders" on public.orders
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'quote_pending'
    and (entity_id is null or entity_id in (select id from public.entities where owner_id = auth.uid()))
  );
drop policy if exists "Users can update their own orders" on public.orders;
