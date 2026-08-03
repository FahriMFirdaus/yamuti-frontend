"use client";

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  return (
    <button
      onClick={() => {
        const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;
        if (navigator.share) {
          navigator.share({ title, text, url: fullUrl }).catch(console.error);
        } else {
          navigator.clipboard.writeText(fullUrl);
          alert("Tautan berhasil disalin!");
        }
      }}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "flex-shrink-0 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:border-red-600 transition-colors",
        className
      )}
      title="Bagikan"
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
}
