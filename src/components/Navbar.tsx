"use client";

import { Plane, Globe, User, LogOut, Moon, Sun, Briefcase } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        transparent
          ? "bg-transparent text-white"
          : "bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 shadow-sm border-b border-slate-200/60 dark:border-slate-700/60",
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
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Sky
            <span className={transparent ? "text-blue-200" : "text-primary-600"}>
              Voyage
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className={cn(
              "hidden md:flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity",
              transparent ? "text-white/90" : "text-slate-600 dark:text-slate-400",
            )}
          >
            <Globe className="w-4 h-4" /> Explorer
          </Link>

          {user && (
            <Link
              href="/trips"
              className={cn(
                "hidden md:flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity",
                transparent ? "text-white/90" : "text-slate-600 dark:text-slate-400",
              )}
            >
              <Briefcase className="w-4 h-4" /> Mes voyages
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              transparent
                ? "bg-white/20 hover:bg-white/30"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
            )}
            aria-label="Basculer le thème"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  transparent
                    ? "bg-white/20 hover:bg-white/30 text-white"
                    : "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/60",
                )}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 top-12 w-56 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      href="/trips"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <Briefcase className="w-4 h-4" /> Mes voyages
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "text-sm font-semibold px-4 py-2 rounded-xl transition-all",
                transparent
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-primary-600 hover:bg-primary-700 text-white",
              )}
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
