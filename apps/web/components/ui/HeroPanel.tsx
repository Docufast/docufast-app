export default function HeroPanel({
  variant = "yellow",
  caption,
}: {
  variant?: "yellow" | "dark";
  caption: string;
}) {
  const bg = variant === "yellow" ? "bg-brand-yellow" : "bg-brand-black";
  const dashed =
    variant === "yellow" ? "border-brand-black text-brand-black" : "border-brand-yellow text-brand-yellow";
  const captionColor = variant === "yellow" ? "text-brand-black/70" : "text-brand-yellow/70";

  return (
    <div className={`hidden lg:flex ${bg} items-center justify-center p-10 border-l-4 border-brand-black`}>
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 border-4 border-dashed ${dashed} p-10 text-center`}>
        <span className="text-sm font-bold uppercase tracking-wider">
          [ Hero image — brand illustration ]
        </span>
        <span className={`max-w-xs text-xs ${captionColor}`}>{caption}</span>
      </div>
    </div>
  );
}
