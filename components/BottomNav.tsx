"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Dashboard", icon: "⌂" },
  { href: "/batches", label: "Grows", icon: "◫" },
  { href: "/inventory", label: "Dry Stock", icon: "▣" },
  { href: "/locations", label: "Locations", icon: "⌖" },
  { href: "/activity", label: "Log", icon: "◷" },
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
