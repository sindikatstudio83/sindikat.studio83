"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { loadCurrentRole } from "@/lib/auth-role";
import { mobileNavItems } from "@/lib/navigation";
import type { UserRole } from "@/types/domain";

export function MobileNav() {
  const [role, setRole] = useState<UserRole>("guest");
  const [supabase] = useState(() => createBrowserSupabase());
  const pathname = usePathname();

  useEffect(() => {
    async function loadRole() {
      setRole(await loadCurrentRole(supabase));
    }
    loadRole();
    const { data } = supabase.auth.onAuthStateChange(() => loadRole());
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  return (
    <nav className="mobile-app-nav" aria-label="Mobilna navigacija">
      {mobileNavItems[role].map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className={pathname === item.href ? "active" : ""}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{item.icon.slice(0, 2).toUpperCase()}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
