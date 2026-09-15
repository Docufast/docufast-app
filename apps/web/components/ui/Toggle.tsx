"use client";

export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "justify-end bg-brand-yellow" : "justify-start bg-brand-gray-light"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-brand-white shadow" />
    </button>
  );
}