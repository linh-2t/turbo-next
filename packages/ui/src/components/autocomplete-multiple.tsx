import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, X } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useDebouncyFn } from 'use-debouncy';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '#shadcn/command';
import { Popover, PopoverContent, PopoverTrigger } from '#shadcn/popover';
import { cn } from '#utils/cn';

import { Badge } from '#shadcn/badge';
import { Button } from '#shadcn/button';
import { Input } from '#shadcn/input';

type OptionValue = string | number;

export interface OptionType {
  value: OptionValue;
  label: string;
}

export type VirtualizedCommandProps<T extends OptionType | string> = {
  height: string;
  options: T[];
  selectedOptions: T[];
  onSelectOptions?: (option: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => OptionValue;
  filterOption: (option: T, searchValue: string) => boolean;
  renderOption?: (option: T) => ReactNode;
  searchValue: string;
  loading?: boolean;
  disabled?: boolean;
};

function VirtualizedCommand<T extends OptionType | string>({
  height,
  options,
  selectedOptions,
  onSelectOptions,
  getOptionLabel,
  getOptionValue,
  filterOption,
  renderOption,
  searchValue,
  loading,
  disabled,
}: VirtualizedCommandProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option => filterOption(option, searchValue));

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const listHeight = Math.min(Number.parseInt(height, 10), filteredOptions.length * 35);

  const handleSelectOption = (option: T) => {
    if (disabled) {
      return;
    }
    const isSelected = selectedOptions.some(item => getOptionValue(item) === getOptionValue(option));
    const newSelected = isSelected
      ? selectedOptions.filter(item => getOptionValue(item) !== getOptionValue(option))
      : [...selectedOptions, option];

    onSelectOptions?.(newSelected);
  };

  return (
    <Command shouldFilter={false}>
      <CommandList>
        <CommandEmpty>{loading ? 'Loading...' : 'No item found.'}</CommandEmpty>
        <CommandGroup
          ref={parentRef}
          style={{
            height: `${listHeight}px`,
            width: '100%',
            overflow: 'auto',
          }}
          className="scroll-bar p-0"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualOptions.map(virtualOption => {
              const option = filteredOptions[virtualOption.index] as T;

              return (
                <CommandItem
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                  }}
                  key={getOptionValue(option)}
                  value={String(getOptionValue(option))}
                  onSelect={() => handleSelectOption(option)}
                  disabled={disabled}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOptions.some(s => getOptionValue(s) === getOptionValue(option))
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {renderOption ? renderOption(option) : getOptionLabel(option)}
                </CommandItem>
              );
            })}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export type AutocompleteMultipleProps<T extends OptionType | string> = {
  options: T[];
  placeholder?: string;
  width?: string;
  height?: string;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => OptionValue;
  filterOption?: (option: T, searchValue: string) => boolean;
  renderOption?: (option: T) => ReactNode;
  disabled?: boolean;
  onChange?: (selectedOptions: T[]) => void;
  value?: T[];
  maxSelected?: number;
  onSearch?: (value: string) => void;
  delay?: number;
};

export function AutocompeteMultiple<T extends OptionType | string>({
  options,
  placeholder = 'Search items...',
  width = '100%',
  height = '300px',
  getOptionLabel = (option: T) => (typeof option === 'string' ? option : option.label),
  getOptionValue = (option: T) => (typeof option === 'string' ? option : option.value),
  filterOption = (option: T, searchValue: string) =>
    getOptionLabel(option).toLowerCase().includes(searchValue.toLowerCase()),
  renderOption,
  disabled = false,
  onChange,
  value,
  maxSelected,
  onSearch,
  delay = 300,
}: AutocompleteMultipleProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<T[]>(value || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    if (value) {
      setSelectedOptions(value);
    }
  }, [value]);

  const handleSelectOptions = useCallback(
    (currentValue: T[]) => {
      if (maxSelected && currentValue.length > maxSelected) {
        return;
      }
      setSelectedOptions(currentValue);
      setSearchValue('');
      onChange?.(currentValue);
      inputRef.current?.focus();
    },
    [maxSelected, onChange]
  );

  const handleClearOption = useCallback(
    (option: T) => {
      setSelectedOptions(prev => {
        const newSelected = prev.filter(item => getOptionValue(item) !== getOptionValue(option));

        onChange?.(newSelected);
        inputRef.current?.focus();
        return newSelected;
      });
    },
    [getOptionValue, onChange]
  );

  const handleClearAll = useCallback(() => {
    setSelectedOptions([]);
    onChange?.([]);
    inputRef.current?.focus();
  }, [onChange]);

  const debouncedSearch = useDebouncyFn(
    useCallback(
      (searchValue: string) => {
        setLoading(true);
        onSearch?.(searchValue);
        setLoading(false);
      },
      [onSearch]
    ),
    delay
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (onSearch) {
        debouncedSearch(value);
      }
    },
    [onSearch, debouncedSearch]
  );

  const handleContainerClick = useCallback(() => {
    // console.log(111, open);
    if (!(disabled || open)) {
      inputRef.current?.focus();
    }
  }, [disabled, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex min-h-11 items-center rounded-md border border-input text-sm',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onClick={handleContainerClick}
          aria-hidden="true"
          tabIndex={-1}
          style={{ width }}
          onKeyDown={() => {
            void 0;
          }}
        >
          <div className="flex flex-grow flex-wrap items-center gap-1 p-2">
            {selectedOptions.map(option => (
              <Badge key={getOptionValue(option)} className={cn('h-6 leading-3', disabled && 'cursor-not-allowed')}>
                {getOptionLabel(option)}
                {!disabled && (
                  <button
                    className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleClearOption(option);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            <Input
              ref={inputRef}
              className={cn(
                'h-auto min-w-20 flex-1 border-none p-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              placeholder={placeholder}
              onChange={e => handleSearch(e.target.value)}
              value={searchValue}
              disabled={disabled}
            />
          </div>
          {!disabled && selectedOptions.length > 0 && (
            <Button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleClearAll();
              }}
              variant="ghost"
              className="h-10 w-10 shrink-0 p-0"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={e => {
          e.preventDefault();
        }}
        className="max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0"
      >
        <VirtualizedCommand
          height={height}
          options={options}
          selectedOptions={selectedOptions}
          onSelectOptions={handleSelectOptions}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          filterOption={filterOption}
          renderOption={renderOption}
          searchValue={searchValue}
          loading={loading}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
