import type { ReactNode } from "react";
import { GeometricPattern } from "@/components/brand/geometric-pattern";
import { LogoMark } from "@/components/brand/logo";

export function AuthCard({ title, subtitle, children, footer, wide = false }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-muted/60 px-4 py-10 sm:py-16">
      <GeometricPattern className="text-primary" opacity={0.04} />
      <div className={`relative mx-auto ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="h-11 w-11" />
            <h1 className="mt-4 font-display text-2xl font-semibold text-primary sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}
