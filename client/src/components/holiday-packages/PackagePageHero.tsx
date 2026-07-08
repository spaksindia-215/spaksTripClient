export default function PackagePageHero({
  title,
  image,
}: {
  title: string;
  image: string;
}) {
  return (
    <section className="relative isolate">
      <div className="relative h-[320px] w-full overflow-hidden">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 grid place-items-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
