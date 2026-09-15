import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-brand-gray-light bg-brand-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
