"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/examen/", label: "Simulacro", icon: TimerIcon },
  { href: "/repaso/", label: "Repaso", icon: RepeatIcon },
  { href: "/glosario/", label: "Glosario", icon: BookIcon },
];

export default function BottomNav() {
  const path = (usePathname() || "/").replace(/\/$/, "") || "/";
  return (
    <nav className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
      <ul className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 rounded-[26px] bg-surface/85 p-1.5 shadow-float ring-1 ring-line backdrop-blur-xl backdrop-saturate-150">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const h = href.replace(/\/$/, "") || "/";
          const active = h === "/" ? path === "/" || path.startsWith("/tema") || path.startsWith("/ajustes") : path.startsWith(h);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 rounded-[20px] text-[11px] font-bold transition-all duration-200 active:scale-95",
                  active ? "bg-indigo-600 text-white shadow-[0_6px_16px_-6px_rgb(79_70_229/0.7)]" : "text-muted hover:text-fg",
                )}
              >
                <Icon active={active} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { active: boolean };
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function HomeIcon({ active }: IconProps) {
  return (
    <svg {...base} strokeWidth={active ? 2.4 : 2}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.18 : 0} />
    </svg>
  );
}
function TimerIcon({ active }: IconProps) {
  return (
    <svg {...base} strokeWidth={active ? 2.4 : 2}>
      <circle cx="12" cy="13" r="8" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.18 : 0} />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </svg>
  );
}
function RepeatIcon({ active }: IconProps) {
  return (
    <svg {...base} strokeWidth={active ? 2.4 : 2}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function BookIcon({ active }: IconProps) {
  return (
    <svg {...base} strokeWidth={active ? 2.4 : 2}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.18 : 0} />
      <path d="M4 19.5V21h16" />
    </svg>
  );
}
