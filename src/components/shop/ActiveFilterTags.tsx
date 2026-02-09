import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterTag {
  key: string;
  label: string;
  value: string;
}

interface ActiveFilterTagsProps {
  filters: FilterTag[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterTags({ filters, onRemove, onClearAll }: ActiveFilterTagsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 transition-colors cursor-pointer"
          onClick={() => onRemove(filter.key)}
        >
          {filter.label}
          <X className="w-3 h-3" />
        </Badge>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
