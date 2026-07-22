"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/batches", label: "Batches", icon: "◫" },
  { href: "/inventory", label: "Inventory", icon: "▣" },
  { href: "/locations", label: "Locations", icon: "⌖" },
  { href: "/activity", label: "Activity", icon: "◷" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={`nav-btn${active ? " active" : ""}`}>
            <div className="icon">{tab.icon}</div>
            <div>{tab.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
