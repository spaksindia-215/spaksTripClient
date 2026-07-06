export default function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignment}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0E1E3A]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-zinc-500 text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
