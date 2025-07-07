'use client';

import { useState } from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  granularity: 'day' | 'week' | 'month';
  onGranularityChange: (granularity: 'day' | 'week' | 'month') => void;
}

const presetRanges = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date();
      return {
        start: format(today, 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        start: format(yesterday, 'yyyy-MM-dd'),
        end: format(yesterday, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => ({
      start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'This week',
    getValue: () => ({
      start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
      end: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last week',
    getValue: () => {
      const lastWeek = subDays(new Date(), 7);
      return {
        start: format(startOfWeek(lastWeek), 'yyyy-MM-dd'),
        end: format(endOfWeek(lastWeek), 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'This month',
    getValue: () => ({
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'Last month',
    getValue: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return {
        start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  granularity,
  onGranularityChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{
    from?: Date;
    to?: Date;
  }>({
    from: new Date(value.start),
    to: new Date(value.end),
  });

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue();
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomRangeSelect = () => {
    if (customRange.from && customRange.to) {
      onChange({
        start: format(customRange.from, 'yyyy-MM-dd'),
        end: format(customRange.to, 'yyyy-MM-dd'),
      });
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    const start = new Date(value.start);
    const end = new Date(value.end);
    
    if (value.start === value.end) {
      return format(start, 'MMM dd, yyyy');
    }
    
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Date Range Selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            {/* Preset Ranges */}
            <div className="border-r p-2 space-y-1">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            {/* Custom Range Calendar */}
            <div className="p-3">
              <div className="text-sm font-medium mb-2">Custom Range</div>
              <Calendar
                mode="range"
                selected={{
                  from: customRange.from,
                  to: customRange.to,
                }}
                onSelect={(range: any) => setCustomRange(range || {})}
                numberOfMonths={2}
                className="rounded-md"
              />
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomRangeSelect}
                  disabled={!customRange.from || !customRange.to}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Granularity Selector */}
      <Select value={granularity} onValueChange={(value) => onGranularityChange(value as any)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Daily</SelectItem>
          <SelectItem value="week">Weekly</SelectItem>
          <SelectItem value="month">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}