// components/PaymentFeeRows.tsx
// The payment processing fee, shown under every quote total before checkout (JSB, 3 Nov 2026).
// The amount comes from lib/paymentFee.js, the same file the API uses to charge.
import { paymentFee, amountToPay } from "@/lib/paymentFee.js";
import { naira } from "@/lib/pricing";

export const PAYMENT_FEE_NOTE =
  "The payment processing fee is charged by our payment provider and paid at checkout. It is shown here before you pay.";

/** Two table rows to put after a quote's Total row. For an estimate, the fee is an estimate too. */
export default function PaymentFeeRows({ total, estimate = false, cellClass = "py-1.5" }: { total: number; estimate?: boolean; cellClass?: string }) {
  if (!total) return null;
  return (
    <>
      <tr>
        <td className={`${cellClass} pr-3`}>{estimate ? "Payment processing fee (estimate)" : "Payment processing fee"}</td>
        <td className={`${cellClass} text-right`}>{naira(paymentFee(total))}</td>
      </tr>
      <tr className="font-bold">
        <td className={cellClass}>{estimate ? "Estimated amount to pay" : "Amount to pay"}</td>
        <td className={`${cellClass} text-right`}>{naira(amountToPay(total))}</td>
      </tr>
    </>
  );
}
