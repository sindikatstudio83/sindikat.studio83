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
      {items.map(item => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            href={item.href}
            key={item.href}
            className={isActive ? "active" : ""}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
