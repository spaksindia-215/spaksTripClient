import { getAirline } from "@/lib/mock/airlines";

export default function AirlineLogo({ code, size = 32 }: { code: string; size?: number }) {
  const a = getAirline(code);
  const hue = a?.logoHue ?? 220;
  const initial = a?.name[0] ?? code[0];
  return (
    <div
      className="grid place-items-center rounded-md text-white font-bold shadow-[var(--shadow-xs)] shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 30) % 360} 80% 35%))`,
        fontSize: size * 0.42,
      }}
      aria-label={a?.name ?? code}
    >
      {initial}
    </div>
  );
}
