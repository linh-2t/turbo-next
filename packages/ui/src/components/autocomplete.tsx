import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '#shadcn/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '#shadcn/command';
import { Popover, PopoverContent, PopoverTrigger } from '#shadcn/popover';
import { cn } from '#utils/cn';

import type { KeyboardEvent, ReactNode } from 'react';

type OptionValue = string | number;

export interface OptionType {
  value: OptionValue;
  label: string;
}

export type VirtualizedCommandProps<T extends OptionType | string> = {
  height: string;
  options: T[];
  placeholder: string;
  selectedOption: T | null;
  initialSearch?: string;
  showSearch?: boolean;
  onSelectOption?: (option: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => OptionValue;
  filterOption: (option: T, searchValue: string) => boolean;
  renderOption?: (option: T) => ReactNode;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
  }
};

function VirtualizedCommand<T extends OptionType | string>({
  height,
  options,
  placeholder,
  selectedOption,
  showSearch,
  initialSearch = '',
  onSelectOption,
  getOptionLabel,
  getOptionValue,
  filterOption,
  renderOption,
}: VirtualizedCommandProps<T>) {
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleSearch = useCallback(
    (search: string) => {
      setSearchValue(search);
      setFilteredOptions(options.filter(option => filterOption(option, search)));
    },
    [options, filterOption]
  );

  useEffect(() => {
    if (initialSearch) {
      handleSearch(initialSearch);
    }
  }, [handleSearch, initialSearch]);

  const listHeight = Math.min(Number.parseInt(height, 10), filteredOptions.length * 35);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      {showSearch && <CommandInput value={searchValue} onValueChange={handleSearch} placeholder={placeholder} />}
      <CommandList>
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup
          ref={parentRef}
          style={{
            height: `${listHeight}px`,
            width: '100%',
            overflow: 'auto',
          }}
          className="scroll-bar"
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
                  onSelect={() => onSelectOption?.(option)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOption && getOptionValue(selectedOption) === getOptionValue(option)
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

export type AutocompleteProps<T extends OptionType | string> = {
  options: T[];
  searchPlaceholder?: string;
  width?: string;
  height?: string;
  showSearch?: boolean;
  value?: T | null;
  onChange?: (option: T | null) => void;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => OptionValue;
  filterOption?: (option: T, searchValue: string) => boolean;
  renderOption?: (option: T) => ReactNode;
};

export function Autocomplete<T extends OptionType | string>({
  options,
  searchPlaceholder = 'Search items...',
  width = '100%',
  height = '300px',
  showSearch,
  value,
  onChange,
  getOptionLabel = (option: T) => (typeof option === 'string' ? option : option.label),
  getOptionValue = (option: T) => (typeof option === 'string' ? option : option.value),
  filterOption = (option: T, searchValue: string) =>
    getOptionLabel(option).toLowerCase().includes(searchValue.toLowerCase()),
  renderOption,
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [initialSearch, setInitialSearch] = useState<string>('');

  useEffect(() => {
    setSelectedOption(value || null);
  }, [value]);

  const handleSelectOption = (currentValue: T) => {
    const newValue =
      selectedOption && getOptionValue(selectedOption) === getOptionValue(currentValue) ? null : currentValue;

    setSelectedOption(newValue);
    setInitialSearch(newValue ? getOptionLabel(newValue) : '');
    setOpen(false);
    onChange?.(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
          style={{
            width,
          }}
        >
          {selectedOption ? getOptionLabel(selectedOption) : searchPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0">
        <VirtualizedCommand
          height={height}
          options={options}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          initialSearch={initialSearch}
          showSearch={showSearch}
          onSelectOption={handleSelectOption}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          filterOption={filterOption}
          renderOption={renderOption}
        />
      </PopoverContent>
    </Popover>
  );
}
