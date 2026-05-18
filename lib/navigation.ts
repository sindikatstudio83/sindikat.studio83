import type { UserRole } from "@/types/domain";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const desktopNavItems: Record<UserRole, NavItem[]> = {
  guest: [
    { icon: "oglasi",      label: "Tražim posao",  href: "/oglasi" },
    { icon: "za-firme",    label: "Nudim posao",   href: "/za-firme" },
    { icon: "firme",       label: "Poslodavci",    href: "/firme" }
  ],
  candidate: [
    { icon: "oglasi",      label: "Oglasi",        href: "/oglasi" },
    { icon: "profil",      label: "Profil",        href: "/profil" },
    { icon: "prijave",     label: "Prijave",       href: "/profil/prijave" }
  ],
  company: [
    { icon: "pregled",     label: "Dashboard",     href: "/firma" },
    { icon: "novi",        label: "Novi oglas",    href: "/firma/novi-oglas" },
    { icon: "selekcija",   label: "Selekcija",     href: "/firma/selekcija" }
  ],
  admin: [
    { icon: "pregled",     label: "Admin",         href: "/admin" },
    { icon: "oglasi",      label: "Oglasi",        href: "/admin/oglasi" },
    { icon: "firme",       label: "Firme",         href: "/admin/firme" },
    { icon: "uplate",      label: "Uplate",        href: "/admin/uplate" }
  ]
};

export const mobileNavItems: Record<UserRole, NavItem[]> = {
  guest: [
    { icon: "home",        label: "Početna",   href: "/" },
    { icon: "oglasi",      label: "Oglasi",    href: "/oglasi" },
    { icon: "firme",       label: "Firme",     href: "/firme" },
    { icon: "za-firme",    label: "Za firme",  href: "/za-firme" },
    { icon: "login",       label: "Prijava",   href: "/login" }
  ],
  candidate: [
    { icon: "oglasi",      label: "Oglasi",    href: "/oglasi" },
    { icon: "prijave",     label: "Prijave",   href: "/profil/prijave" },
    { icon: "sacuvani",    label: "Sačuvano",  href: "/profil/sacuvani" },
    { icon: "profil",      label: "Profil",    href: "/profil" },
    { icon: "upozorenja",  label: "Alertovi",  href: "/profil/upozorenja" }
  ],
  company: [
    { icon: "pregled",     label: "Pregled",   href: "/firma" },
    { icon: "novi",        label: "Novi oglas", href: "/firma/novi-oglas" },
    { icon: "selekcija",   label: "Selekcija", href: "/firma/selekcija" },
    { icon: "kandidati",   label: "Kandidati", href: "/firma/kandidati" },
    { icon: "pretplata",   label: "Pretplata", href: "/firma/pretplata" }
  ],
  admin: [
    { icon: "home",        label: "Pregled",   href: "/admin" },
    { icon: "uplate",      label: "Uplate",    href: "/admin/uplate" },
    { icon: "oglasi",      label: "Oglasi",    href: "/admin/oglasi" },
    { icon: "firme",       label: "Firme",     href: "/admin/firme" },
    { icon: "paketi",      label: "Paketi",    href: "/admin/paketi" },
    { icon: "audit",       label: "Audit",     href: "/admin/audit-log" }
  ]
};
