import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // if using shadcn/ui
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Label } from "./label";

export default function FilterPopover({ filter, selected, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <Label>{filter?.label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="border w-full rounded h-[35px] px-3 py-1 my-1 text-sm bg-white cursor-pointer flex justify-between items-center w-[200px]"
            role="button"
          >
            {selected?.name ? selected.name : `Select ${filter.label}`}
            {selected?.name && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(filter.key, null);
                  setOpen(false); // close popover on clear
                }}
                className="ml-2 text-gray-500 text-xl hover:text-black cursor-pointer border-none outline-orange-300"
              >
                ✕
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px] bg-white">
          <Command>
            <CommandInput placeholder={`Search ${filter.label}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {filter.options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  onSelect={() => {
                    onChange(filter.key, opt.id);
                    setOpen(false); // close on select
                  }}
                >
                  {opt.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
