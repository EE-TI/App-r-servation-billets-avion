"use client";

import { Plane, Globe, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        transparent
          ? "bg-transparent text-white"
          : "bg-white/80 backdrop-blur-xl text-slate-800 shadow-sm border-b border-slate-200/60",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              transparent ? "bg-white/20" : "bg-primary-600",
            )}
          >
            <Plane
              className={cn("w-5 h-5", transparent ? "text-white" : "text-white")}
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Sky<span className={transparent ? "text-blue-200" : "text-primary-600"}>Voyage</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "hover:opacity-80 transition-opacity flex items-center gap-1.5",
              transparent ? "text-white/90" : "text-slate-600",
            )}
          >
            <Globe className="w-4 h-4" /> Explorer
          </Link>
          <Link
            href="/"
            className={cn(
              "hover:opacity-80 transition-opacity",
              transparent ? "text-white/90" : "text-slate-600",
            )}
          >
            Mes voyages
          </Link>
          <button
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              transparent
                ? "bg-white/20 hover:bg-white/30"
                : "bg-slate-100 hover:bg-slate-200",
            )}
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
