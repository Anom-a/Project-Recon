import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue-bright mb-0.5">{eyebrow}</p>}
        <h2 className="text-xl sm:text-2xl font-bold text-brand-ink">{title}</h2>
        {description && <p className="text-xs sm:text-sm text-brand-muted mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
