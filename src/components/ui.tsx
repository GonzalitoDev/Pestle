import { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:opacity-90 border-transparent',
  accent: 'bg-accent text-accent-fg hover:opacity-90 border-transparent',
  secondary: 'bg-surface text-fg border-line hover:bg-surface-2 hover:border-line-strong',
  ghost: 'bg-transparent text-fg border-transparent hover:bg-surface-2',
  danger: 'bg-surface text-danger border-line hover:bg-danger-soft hover:border-danger/40',
  success: 'bg-success-soft text-success border-success/30 hover:border-success/60',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon: Icon, loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border font-medium whitespace-nowrap transition-all',
        'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : Icon && <Icon className="size-4 shrink-0" aria-hidden />}
      {children}
    </button>
  );
});

/** Same look as Button, for links (anchors and router Links pass className through). */
export const buttonClass = (variant: Variant = 'secondary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center rounded-lg border font-medium whitespace-nowrap transition-all active:scale-[0.98]',
    VARIANTS[variant],
    SIZES[size],
    className
  );

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block size-5 rounded-full border-2 border-current border-t-transparent animate-spin', className)}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl border border-line bg-surface shadow-card', className)}>{children}</div>;
}

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warn';
const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border-line',
  accent: 'bg-accent-soft text-accent border-accent/20',
  success: 'bg-success-soft text-success border-success/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  warn: 'bg-warn-soft text-warn border-warn/20',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium', TONES[tone], className)}>
      {children}
    </span>
  );
}

export function LanguageBadge({ language }: { language: string }) {
  return <Badge className="font-mono uppercase tracking-wide">{language}</Badge>;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-semibold tracking-tight">
          {Icon && <Icon className="size-7 text-accent" aria-hidden />}
          {title}
        </h1>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full h-9 appearance-none rounded-lg border border-line bg-surface pl-3 pr-9 text-sm',
          'hover:border-line-strong focus:border-accent outline-none transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted" aria-hidden />
    </div>
  );
}

/** Two-or-more option toggle (radio group semantics). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-surface-2 p-1">
      {options.map(({ value: v, label: l, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'flex h-8 items-center justify-center gap-1.5 rounded-md text-sm transition-all',
            value === v ? 'bg-surface text-fg shadow-card font-medium' : 'text-muted hover:text-fg'
          )}
        >
          {Icon && <Icon className="size-3.5" aria-hidden />}
          {l}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      <div className="rounded-full bg-surface-2 p-3">
        <Icon className="size-6 text-muted" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{children}</kbd>
  );
}
