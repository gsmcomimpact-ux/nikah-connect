import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Option } from "@/lib/constants/options";

const control =
  "block w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[15px] text-ink shadow-sm placeholder:text-gray-400 focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20 disabled:bg-muted";

export function Field({ label, htmlFor, hint, error, optional, children, className }: { label: string; htmlFor?: string; hint?: string; error?: string[] | string; optional?: boolean; children: ReactNode; className?: string }) {
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-gray-500">(facultatif)</span>}
      </label>
      {children}
      {hint && !msg && <p className="text-xs text-gray-500">{hint}</p>}
      {msg && (
        <p className="text-xs font-medium text-red-700" role="alert">
          {msg}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28", className)} {...props} />;
}

export function Select({ options, placeholder, className, ...props }: ComponentProps<"select"> & { options: Option[]; placeholder?: string }) {
  return (
    <select className={cn(control, "appearance-none bg-[length:1rem] bg-[right_0.9rem_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E\")" }} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Groupe de cases à cocher stylisées en « pastilles ». */
export function ChipGroup({ name, options, defaultValues = [], columns }: { name: string; options: Option[]; defaultValues?: string[]; columns?: boolean }) {
  return (
    <div className={cn(columns ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-wrap gap-2")}>
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValues.includes(o.value)} className="peer sr-only" />
          <span className="inline-flex w-full items-center rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm text-ink transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/** Choix unique présenté en cartes (boutons radio). */
export function RadioCards({ name, options, defaultValue, required }: { name: string; options: Option[]; defaultValue?: string | null; required?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type="radio" name={name} value={o.value} defaultChecked={defaultValue === o.value} required={required} className="peer sr-only" />
          <span className="flex h-full items-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:font-medium peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function Checkbox({ label, name, defaultChecked, description }: { label: ReactNode; name: string; defaultChecked?: boolean; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 rounded border-gray-300 accent-[var(--brand-primary)]" />
      <span className="text-sm">
        <span className="text-ink">{label}</span>
        {description && <span className="block text-xs text-gray-500">{description}</span>}
      </span>
    </label>
  );
}
