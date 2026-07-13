import Link from "next/link";

const prototypes = [
  {
    href: "/wheel",
    title: "Daily Spin Wheel",
    note: "Player-facing wheel — design pass 1",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold">rizzy prototypes</h1>
      <p className="mt-1 text-sm text-app-secondary-text">
        UI explorations — click through to each prototype.
      </p>
      <ul className="mt-8 space-y-3">
        {prototypes.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="block rounded-xl border border-app-light-stroke bg-app-dark-100 px-5 py-4 transition-colors hover:bg-app-dark-200"
            >
              <span className="font-semibold">{p.title}</span>
              <span className="mt-0.5 block text-sm text-app-secondary-text">
                {p.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
