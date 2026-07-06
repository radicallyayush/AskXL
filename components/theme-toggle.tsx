"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("askxl-theme") as ThemeMode | null;
    const preferred = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("askxl-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
