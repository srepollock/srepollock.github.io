import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-8">
      <div className="panel max-w-xl p-8 font-mono">
        <p className="text-amber">404 · route not found</p>
        <p className="mt-4 text-muted">
          <span className="text-accent">$</span> cd {"<this page>"}
          <br />
          cd: no such district
        </p>
        <Link href="/" className="mt-8 inline-block text-accent link-underline">
          ← fly home
        </Link>
      </div>
    </div>
  );
}
