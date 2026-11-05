export type DistrictId = "skyline" | "work" | "projects" | "about" | "contact";

export type Vec3 = readonly [number, number, number];

export type District = {
  id: DistrictId;
  label: string;
  href: string;
  command: string;
  center: Vec3;
  camera: { position: Vec3; target: Vec3 };
};

export const districts: Readonly<Record<DistrictId, District>> = {
  skyline: {
    id: "skyline",
    label: "Home",
    href: "/",
    command: "cd ~",
    center: [0, 0, -10],
    camera: { position: [0, 88, 215], target: [0, 18, -60] },
  },
  work: {
    id: "work",
    label: "Work",
    href: "/work/",
    command: "cd work",
    center: [-75, 0, -35],
    camera: { position: [-18, 62, 42], target: [-82, 4, -42] },
  },
  projects: {
    id: "projects",
    label: "Projects",
    href: "/projects/",
    command: "cd projects",
    center: [70, 0, 15],
    camera: { position: [18, 56, 98], target: [76, 8, 8] },
  },
  about: {
    id: "about",
    label: "About",
    href: "/about/",
    command: "cd about",
    center: [-60, 0, 55],
    camera: { position: [-8, 42, 132], target: [-62, 2, 48] },
  },
  contact: {
    id: "contact",
    label: "Contact",
    href: "/contact/",
    command: "cd contact",
    center: [95, 0, -55],
    camera: { position: [22, 80, 62], target: [100, 30, -66] },
  },
};

export const navOrder: readonly DistrictId[] = ["skyline", "work", "projects", "about", "contact"];

export function districtForPath(pathname: string): DistrictId {
  const segment = pathname.split("/").filter(Boolean)[0];
  switch (segment) {
    case "work":
    case "projects":
    case "about":
    case "contact":
      return segment;
    default:
      return "skyline";
  }
}
