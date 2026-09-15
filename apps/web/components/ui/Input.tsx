import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-wide text-brand-gray"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-card border border-brand-gray-light px-3 py-2.5 text-brand-black outline-none focus:border-brand-yellow ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
