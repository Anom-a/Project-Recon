import { Package, Cpu, Radio, Wrench, Shirt, BookOpen, Bot, ShoppingBag } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { ProductCategory } from '@/domains/store/model/types';

const CATEGORY_ICONS: Record<string, typeof Package> = {
  Microcontrollers: Cpu,
  Sensors: Radio,
  Accessories: Wrench,
  Apparel: Shirt,
  Bags: ShoppingBag,
  Stationery: BookOpen,
  'Robotics Kits': Bot,
  Robotics: Bot,
};

export function getCategoryIcon(name: string) {
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Package;
}

interface CategoryChipsProps {
  categories: ProductCategory[];
  selectedId?: string;
  loading?: boolean;
  onSelect: (categoryId: string | undefined) => void;
  className?: string;
}

export function CategoryChips({
  categories,
  selectedId,
  loading,
  onSelect,
  className,
}: CategoryChipsProps) {
  return (
    <div className={cn('flex gap-1.5 min-w-max', className)}>
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={cn(
          'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          !selectedId
            ? 'bg-brand-blue-bright text-white shadow-sm'
            : 'bg-white text-brand-muted border border-brand-border hover:border-brand-blue-bright/40 hover:text-brand-ink',
        )}
      >
        All
      </button>

      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shrink-0 h-7 w-16 bg-brand-surface rounded-full animate-pulse" />
          ))
        : (Array.isArray(categories) ? categories : []).map((cat) => {
            const active = selectedId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  active
                    ? 'bg-brand-blue-bright text-white shadow-sm'
                    : 'bg-white text-brand-muted border border-brand-border hover:border-brand-blue-bright/40 hover:text-brand-ink',
                )}
              >
                {cat.name}
              </button>
            );
          })}
    </div>
  );
}
