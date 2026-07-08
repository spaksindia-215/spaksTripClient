export default function VisaHero({ title }: { title: string }) {
  return (
    <section className="relative h-36 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[#0a2a1a]/72" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{title}</h1>
      </div>
    </section>
  );
}
