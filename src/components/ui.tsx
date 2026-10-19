"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Texto con **negrita**, *cursiva* y `código` en línea */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-bold text-fg">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.length > 2 && p.startsWith("*") && p.endsWith("*"))
          return (
            <em key={i} className="italic">
              {p.slice(1, -1)}
            </em>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[0.84em] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              {p.slice(1, -1)}
            </code>
          );
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string | true;
  right?: ReactNode;
}) {
  const router = useRouter();
  const backCls =
    "-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-fg shadow-card ring-1 ring-line transition active:scale-95";
  return (
    <header className="sticky top-0 z-30 bg-bg/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-16 items-center gap-3">
        {back &&
          (typeof back === "string" ? (
            <Link href={back} aria-label="Volver" className={backCls}>
              <ChevronLeft />
            </Link>
          ) : (
            <button onClick={() => router.back()} aria-label="Volver" className={backCls}>
              <ChevronLeft />
            </button>
          ))}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-extrabold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs font-medium text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const cls = cn(
    "rounded-3xl bg-surface p-4 shadow-card ring-1 ring-line",
    onClick && "w-full text-left transition duration-150 active:scale-[0.985] hover:ring-indigo-200 dark:hover:ring-indigo-500/30",
    className,
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  ) : (
    <div className={cls}>{children}</div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "success" | "danger";

/** Botón con efecto táctil (sombra inferior que se "hunde" al tocar) */
export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
  type = "button",
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  full?: boolean;
}) {
  const styles: Record<BtnVariant, string> = {
    primary:
      "bg-indigo-600 text-white shadow-[0_4px_0_0_var(--color-indigo-800)] hover:bg-indigo-500 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-indigo-800)]",
    secondary:
      "bg-surface text-fg ring-1 ring-line shadow-[0_4px_0_0_var(--color-slate-200)] dark:shadow-[0_4px_0_0_rgb(0_0_0/0.45)] hover:bg-surface-2 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-slate-200)]",
    ghost: "text-muted hover:bg-surface-2 hover:text-fg",
    success:
      "bg-emerald-500 text-white shadow-[0_4px_0_0_var(--color-emerald-700)] hover:bg-emerald-400 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-emerald-700)]",
    danger:
      "bg-rose-500 text-white shadow-[0_4px_0_0_var(--color-rose-700)] hover:bg-rose-400 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-rose-700)]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[52px] select-none items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold tracking-tight transition-all duration-100",
        styles[variant],
        "disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:ring-0 dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, className, color = "bg-indigo-500", size = "md" }: { value: number; className?: string; color?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10", size === "sm" ? "h-1.5" : size === "lg" ? "h-3.5" : "h-2.5", className)}>
      <div
        className={cn("relative h-full rounded-full transition-all duration-500 ease-out", color)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      >
        {size === "lg" && value > 6 && <span className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/35" />}
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 48,
  stroke = 5,
  color = "#6366f1",
  track = "stroke-slate-200 dark:stroke-white/10",
  label,
  labelClass,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  labelClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={track} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: "stroke-dashoffset .7s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-extrabold tabular-nums", labelClass)}>{label ?? `${Math.round(v)}%`}</span>
    </div>
  );
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95",
        active ? "bg-fg text-bg shadow-card" : "bg-surface text-fg/80 ring-1 ring-line hover:ring-indigo-200 dark:hover:ring-indigo-500/30",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold", className)}>{children}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-extrabold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface text-4xl shadow-card ring-1 ring-line">{icon}</div>
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
