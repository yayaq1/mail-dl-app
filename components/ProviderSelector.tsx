'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getProviderList } from '@/lib/providers';

interface ProviderSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export default function ProviderSelector({ value, onValueChange, disabled }: ProviderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const providers = getProviderList();

  const filteredProviders = providers.filter((provider) =>
    provider.provider.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProvider = providers.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            {selectedProvider ? selectedProvider.provider.name : 'Select provider...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search providers..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredProviders.length === 0 ? (
              <CommandEmpty>No provider found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredProviders.map((provider) => {
                  const handleSelect = () => {
                    onValueChange(provider.id);
                    setOpen(false);
                    setSearch('');
                  };
                  
                  return (
                    <div
                      key={provider.id}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
                        value === provider.id && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={handleSelect}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === provider.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {provider.provider.name}
                    </div>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
