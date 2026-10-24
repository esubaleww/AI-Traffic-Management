import type { ReactNode } from "react";

type CardProps = {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Card({ title, icon, actions, children, className = "", bodyClassName = "" }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-slate-800 bg-slate-900 shadow-sm shadow-black/20 ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-200">
            {icon}
            {title}
          </h2>
          {actions}
        </header>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
