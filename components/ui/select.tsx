"use client";

import * as React from "react";

import { cn } from "@/components/ui/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}
