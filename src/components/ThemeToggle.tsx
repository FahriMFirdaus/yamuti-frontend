"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [popupInfo, setPopupInfo] = React.useState<string | null>(null);
  
  React.useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    let nextTheme = "system";
    let message = "Tema: Mengikuti Sistem 💻";
    
    if (theme === "system") {
      nextTheme = "light";
      message = "Tema: Terang ☀️";
    } else if (theme === "light") {
      nextTheme = "dark";
      message = "Tema: Gelap 🌙";
    }
    
    setTheme(nextTheme);
    setPopupInfo(message);
    
    setTimeout(() => {
      setPopupInfo(null);
    }, 2000);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-xl">
        <span className="sr-only">Ubah Tema</span>
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={cycleTheme}
        className="relative border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
      >
        {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] text-zinc-900 transition-all" />}
        {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] text-zinc-100 transition-all" />}
        {theme === "system" && <Monitor className="h-[1.1rem] w-[1.1rem] text-zinc-600 dark:text-zinc-400 transition-all" />}
        <span className="sr-only">Ubah Tema</span>
      </Button>

      {popupInfo && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-full shadow-2xl shadow-black/20 transition-all animate-in fade-in zoom-in-95 slide-in-from-top-4">
          {popupInfo}
        </div>
      )}
    </>
  );
}
