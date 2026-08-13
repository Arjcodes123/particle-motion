"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Dark is the default per the strategy brief (§3); it suits the lapis/gold
 * register. `disableTransitionOnChange` stops every colour token from
 * animating at once when the user flips themes.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      // enableSystem is off deliberately. With it on, the OS preference
      // overrides defaultTheme, so anyone on a light-mode machine got a light
      // site. The brief specifies dark as the default look with light
      // available via the toggle, which means the brand decides, not the OS.
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
