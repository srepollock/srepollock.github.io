export type SocialLink = {
  label: string;
  href: string;
  note: string;
};

export const site = {
  name: "Spencer Pollock",
  url: "https://spollock.ca",
  title: "Platform engineer & builder",
  location: "North Vancouver, BC",
  email: "spencer@spollock.ca",
  description:
    "Spencer Pollock — senior platform engineer in Vancouver, BC. CI/CD, hybrid cloud delivery, and the tooling product teams ship with. Founder of Developer Box Inc.",
} as const;

export const socialLinks: readonly SocialLink[] = [
  { label: "GitHub", href: "https://github.com/srepollock", note: "code and side projects" },
  { label: "LinkedIn", href: "https://linkedin.com/in/srepollock", note: "the formal version" },
  { label: "Medium", href: "https://srepollock.medium.com", note: "older writing" },
];
