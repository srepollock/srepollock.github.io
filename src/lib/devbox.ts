export const DEVBOX_ORIGIN = "https://developerbox.ca";
export const DEVBOX_PROJECTS_BASE = `${DEVBOX_ORIGIN}/projects`;

export function devboxProjectUrl(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Invalid Developer Box project slug: "${slug}"`);
  }
  return `${DEVBOX_PROJECTS_BASE}/${slug}/`;
}
