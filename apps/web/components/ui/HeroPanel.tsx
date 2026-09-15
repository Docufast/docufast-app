import Image from "next/image";

export default function HeroPanel({
  src,
  alt,
  bg = "yellow",
}: {
  src: string;
  alt: string;
  bg?: "yellow" | "dark";
}) {
  const bgClass = bg === "yellow" ? "bg-brand-yellow" : "bg-brand-black";

  return (
    <div className={`relative hidden lg:block ${bgClass} border-l-4 border-brand-black`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        sizes="50vw"
      />
    </div>
  );
}
