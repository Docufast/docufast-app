import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "w-full rounded-card px-4 py-3 font-semibold transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark",
    secondary: "bg-brand-black text-brand-white hover:bg-neutral-800",
    outline:
      "border border-brand-gray-light text-brand-black hover:bg-brand-offwhite",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
