import { site, socialLinks } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-6 font-mono text-xs text-subtle sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p>
          © {new Date().getFullYear()} {site.name} · {site.location}
        </p>
        <ul className="flex gap-4">
          {socialLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="link-underline" rel="noopener">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
