"use client";

import { LogOut, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        {/* Mobile menu button placeholder */}
        <button className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white hidden sm:block">
          Dashboard
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <Bell className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-zinc-800 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
