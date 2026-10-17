"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: string;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: string) => void;
  themes: string[];
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  // Inisialisasi tema dari localStorage dan sistem saat client-side mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as Theme | null;
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setThemeState(saved);
      }
    } catch (e) {
      // Ignore localStorage access restrictions
    }
  }, [storageKey]);

  // Efek penerapan class 'dark' ke documentElement
  React.useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = false;
      if (theme === "system") {
        isDark = media.matches;
      } else {
        isDark = theme === "dark";
      }

      setResolvedTheme(isDark ? "dark" : "light");

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = React.useCallback(
    (newTheme: string) => {
      const validTheme: Theme =
        newTheme === "light" || newTheme === "dark" || newTheme === "system"
          ? newTheme
          : "system";
      setThemeState(validTheme);
      try {
        localStorage.setItem(storageKey, validTheme);
      } catch (e) {
        // Ignore
      }
    },
    [storageKey]
  );

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: ["light", "dark", "system"],
    }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as "light" | "dark",
      setTheme: (_: string) => {},
      themes: ["light", "dark", "system"],
    };
  }
  return context;
}
