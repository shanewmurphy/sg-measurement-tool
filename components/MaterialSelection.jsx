"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const film = [
  {
    label: "Not Specified",
    value: "not specified",
  },
  {
    label: "Alon Frost",
    value: "alon frost",
  },
  {
    label: "Alu 50 Static",
    value: "alu 50 static",
  },
  {
    label: "Alu 50 XC",
    value: "alu 50 xc",
  },
  {
    label: "Alu 70 C",
    value: "alu 70 c",
  },
  {
    label: "Alu 70 XC",
    value: "alu 70 xc",
  },
  {
    label: "Alu 80 C",
    value: "alu 80 c",
  },
  {
    label: "Alu 80 Static",
    value: "alu 80 static",
  },
  {
    label: "Alu 80 XC",
    value: "alu 80 xc",
  },
  {
    label: "Azur 80 XC",
    value: "azur 80 xc",
  },
  {
    label: "Blue 80 C",
    value: "blue 80 c",
  },
  {
    label: "Bronze 80 C",
    value: "bronze 80 c",
  },
  {
    label: "Bronze 80 XC",
    value: "bronze 80 xc",
  },
  {
    label: "Charcoal 95 XC",
    value: "charcoal 95 xc",
  },
  {
    label: "Chrome 245 XC",
    value: "chrome 245 xc",
  },
  {
    label: "Chrome 270 XC",
    value: "chrome 270 xc",
  },
  {
    label: "Chrome 285 XC",
    value: "chrome 285 xc",
  },
  {
    label: "Clarity 245 XC",
    value: "clarity 245 xc",
  },
  {
    label: "Clarity 333 XC",
    value: "clarity 333 xc",
  },
  {
    label: "Copper 50 C",
    value: "copper 50 c",
  },
  {
    label: "Copper 65 C",
    value: "copper 65 c",
  },
  {
    label: "Copper 80 C",
    value: "copper 80 c",
  },
  {
    label: "Copper 80 XC",
    value: "copper 80 xc",
  },
  {
    label: "Green 80 C",
    value: "green 80 c",
  },
  {
    label: "Green 80 XC",
    value: "green 80 xc",
  },
  {
    label: "Multiglass 66 C",
    value: "multiglass 66 c",
  },
  {
    label: "Natural 65 XC",
    value: "natural 65 xc",
  },
  {
    label: "Natural 80 XC",
    value: "natural 80 xc",
  },
  {
    label: "Nickel 80 XC",
    value: "nickel 80 xc",
  },
  {
    label: "Silver 44 XC",
    value: "silver 44 xc",
  },
  {
    label: "Silver 50 C",
    value: "silver 50 c",
  },
  {
    label: "Silver 60 XC",
    value: "silver 60 xc",
  },
  {
    label: "Silver 70 C",
    value: "silver 70 c",
  },
  {
    label: "Silver 80 C",
    value: "silver 80 c",
  },
  {
    label: "Silver 80 XC",
    value: "silver 80 xc",
  },
  {
    label: "Silver 95 C",
    value: "silver 95 c",
  },
  {
    label: "Silver 99 C",
    value: "silver 99 c",
  },
  {
    label: "Sky Black 99 XC",
    value: "sky black 99 xc",
  },
  {
    label: "Spectra 30 C",
    value: "spectra 30 c",
  },
  {
    label: "Spectra 33 C",
    value: "spectra 33 c",
  },
  {
    label: "Spectra 333 XC",
    value: "spectra 333 xc",
  },
  {
    label: "Steel 50 C",
    value: "steel 50 c",
  },
  {
    label: "Steel 65 C",
    value: "steel 65 c",
  },
  {
    label: "Steel 75 C",
    value: "steel 75 c",
  },
  {
    label: "Titane 250 XC",
    value: "titane 250 xc",
  },
  {
    label: "Titane 275 XC",
    value: "titane 275 xc",
  },
  {
    label: "Vista 80 C",
    value: "vista 80 c",
  },
  {
    label: "Vista 90 C",
    value: "vista 90 c",
  },
  {
    label: "Vista 90 XC",
    value: "vista 90 xc",
  },
  {
    label: "Vista 99 XC",
    value: "vista 99 xc",
  },
];

export default function MaterialSelection() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Select Material Type</Label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
            id={id}
            role="combobox"
            variant="outline"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? film.find((film) => film.value === value)?.label
                : "Select film"}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/80"
              size={16}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
        >
          <Command>
            <CommandInput placeholder="Search film..." />
            <CommandList>
              <CommandEmpty>No film found.</CommandEmpty>
              <CommandGroup>
                {film.map((film) => (
                  <CommandItem
                    key={film.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    value={film.value}
                  >
                    {film.label}
                    {value === film.value && (
                      <CheckIcon className="ml-auto" size={16} />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
