"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";

export default function Quality({ value, onChange }) {
  return (
    <NumberField value={value} minValue={1} onChange={onChange}>
      <div className="*:not-first:mt-2">
        <Label className="font-medium text-foreground text-sm">
          Number of Cut Copies
        </Label>

        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border border-input text-sm">
          <Button
            slot="decrement"
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MinusIcon size={16} />
          </Button>

          <Input className="w-full text-center border-gray-600" />

          <Button
            slot="increment"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon size={16} />
          </Button>
        </Group>
      </div>
    </NumberField>
  );
}
