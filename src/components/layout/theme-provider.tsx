"use client";

/**
 * ThemeProvider keeps light/dark mode state in sync across the app.
 * Props: standard next-themes provider props passed through to ThemeProvider.
 * Used in: src/app/layout.tsx.
 * TODO: Update defaultTheme if you decide to force dark mode or system mode later.
 */
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
