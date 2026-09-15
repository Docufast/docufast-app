export type Strength = "weak" | "fair" | "strong" | "very-strong";

export function getPasswordStrength(password: string): Strength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return "weak";
  if (score === 2) return "fair";
  if (score <= 4) return "strong";
  return "very-strong";
}

export const strengthLabel: Record<Strength, string> = {
  weak: "Weak — add more characters",
  fair: "Fair — 8 characters minimum, mix in a number",
  strong: "Strong — a solid password",
  "very-strong": "Very strong",
};

export const strengthColor: Record<Strength, string> = {
  weak: "text-brand-error",
  fair: "text-brand-amber",
  strong: "text-brand-success",
  "very-strong": "text-brand-success",
};
