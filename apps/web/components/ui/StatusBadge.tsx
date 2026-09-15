type Status = "pending" | "success" | "error" | "info";

const styles: Record<Status, string> = {
  pending: "bg-brand-amber/10 text-brand-amber",
  success: "bg-brand-success/10 text-brand-success",
  error: "bg-brand-error/10 text-brand-error",
  info: "bg-brand-gray-light text-brand-gray",
};

export default function StatusBadge({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {children}
    </span>
  );
}
