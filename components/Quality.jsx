"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";

export default function Quality() {
  return (
    <NumberField defaultValue={1} minValue={1}>
      <div className="*:not-first:mt-2">
        <Label className="font-medium text-foreground text-sm">
          Number of Cut Copies
        </Label>
        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs outline-none transition-[color,box-shadow] data-focus-within:border-ring data-disabled:opacity-50 data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40">
          <Button
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="decrement"
          >
            <MinusIcon aria-hidden="true" size={16} />
          </Button>
          <Input className="w-full grow bg-background px-3 py-2 text-center text-foreground tabular-nums" />
          <Button
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            slot="increment"
          >
            <PlusIcon aria-hidden="true" size={16} />
          </Button>
        </Group>
      </div>
    </NumberField>
  );
}
