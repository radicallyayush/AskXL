"use client";

import * as React from "react";

import { cn } from "@/components/ui/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "border-transparent bg-foreground text-background hover:opacity-90",
        variant === "secondary" && "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "border-transparent bg-transparent text-foreground hover:bg-muted",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "lg" && "h-12 px-6",
        className
      )}
      {...props}
    />
  );
}
