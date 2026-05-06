"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { mobileNavItems } from "@/lib/navigation";

export function MobileNav() {
  const { role } = useAuth();
  const pathname = usePathname();
  const items = mobileNavItems[role];

  return (
    <nav className="mobile-app-nav" aria-label="Mobilna navigacija">
      {items.map(item => (
        <Link
          href={item.href}
          key={item.href}
          className={pathname === item.href ? "active" : ""}
        >
          <span className="nav-icon">{item.icon.slice(0, 2).toUpperCase()}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
