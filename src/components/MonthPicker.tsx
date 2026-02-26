import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  value: string; // YYYY-MM-DD (always 1st)
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthPicker({ value, onChange, id, required, label }: Props) {
  const now = new Date();
  const [year, setYear] = useState(() => (value ? parseInt(value.slice(0, 4)) : now.getFullYear()));
  const [open, setOpen] = useState(false);

  const selectedMonth = value ? parseInt(value.slice(5, 7)) - 1 : null;
  const selectedYear = value ? parseInt(value.slice(0, 4)) : null;

  const pick = (monthIndex: number) => {
    const m = String(monthIndex + 1).padStart(2, '0');
    onChange(`${year}-${m}-01`);
    setOpen(false);
  };

  const displayText = value
    ? format(new Date(value + 'T00:00:00'), 'MMMM yyyy')
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText ?? 'Select month…'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        {/* Year nav */}
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(y => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{year}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(y => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {MONTHS.map((m, i) => {
            const isSelected = selectedYear === year && selectedMonth === i;
            return (
              <Button
                key={m}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                className="text-xs h-8"
                onClick={() => pick(i)}
              >
                {m.slice(0, 3)}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Effective dates are always the 1st of the month.
        </p>
      </PopoverContent>
    </Popover>
  );
}
