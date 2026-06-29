"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Users,
  Search,
  ArrowRightLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { airports } from "@/lib/data";

function AirportDropdown({
  query,
  onSelect,
  visible,
}: {
  query: string;
  onSelect: (code: string, city: string) => void;
  visible: boolean;
}) {
  const filtered = airports.filter(
    (a) =>
      a.code.toLowerCase().includes(query.toLowerCase()) ||
      a.city.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (!visible || query.length < 1 || filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
    >
      {filtered.slice(0, 5).map((a) => (
        <button
          key={a.code}
          type="button"
          onMouseDown={() => onSelect(a.code, a.city)}
          className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{a.city}</span>
            <span className="text-slate-400 text-sm ml-2">{a.name}</span>
          </div>
          <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50">
            {a.code}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

export function FlightSearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destination, setDestination] = useState("");
  const [destCode, setDestCode] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const destRef = useRef<HTMLInputElement>(null);

  function swap() {
    const tmpName = origin;
    const tmpCode = originCode;
    setOrigin(destination);
    setOriginCode(destCode);
    setDestination(tmpName);
    setDestCode(tmpCode);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!originCode || !destCode) return;
    const params = new URLSearchParams({
      from: originCode,
      to: destCode,
      date: date || new Date().toISOString().split("T")[0],
      pax: passengers,
    });
    router.push(`/results?${params.toString()}`);
  }

  const inputCls = "flex items-center gap-2 bg-slate-50 dark:bg-dark-900 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/50 transition-all";

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          "bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50",
          compact ? "p-4" : "p-3 sm:p-4",
        )}
      >
        <div
          className={cn(
            "grid gap-2",
            compact
              ? "grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_auto]",
          )}
        >
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-3">
              Départ
            </label>
            <div className={inputCls}>
              <PlaneTakeoff className="w-4 h-4 text-primary-500 shrink-0" />
              <input
                type="text"
                placeholder="Ville ou aéroport"
                className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setOriginCode(""); setShowOriginDrop(true); }}
                onFocus={() => setShowOriginDrop(true)}
                onBlur={() => setTimeout(() => setShowOriginDrop(false), 150)}
              />
              {originCode && <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">{originCode}</span>}
            </div>
            <AnimatePresence>
              <AirportDropdown
                query={origin}
                visible={showOriginDrop && !originCode}
                onSelect={(code, city) => { setOriginCode(code); setOrigin(city); setShowOriginDrop(false); destRef.current?.focus(); }}
              />
            </AnimatePresence>
          </div>

          {!compact && (
            <div className="hidden lg:flex items-end pb-2 justify-center">
              <button
                type="button"
                onClick={swap}
                className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-700 flex items-center justify-center transition-all hover:rotate-180 duration-300"
              >
                <ArrowRightLeft className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </button>
            </div>
          )}

          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-3">
              Arrivée
            </label>
            <div className={inputCls}>
              <PlaneLanding className="w-4 h-4 text-accent-400 shrink-0" />
              <input
                ref={destRef}
                type="text"
                placeholder="Ville ou aéroport"
                className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setDestCode(""); setShowDestDrop(true); }}
                onFocus={() => setShowDestDrop(true)}
                onBlur={() => setTimeout(() => setShowDestDrop(false), 150)}
              />
              {destCode && <span className="text-xs font-mono font-bold text-accent-500">{destCode}</span>}
            </div>
            <AnimatePresence>
              <AirportDropdown
                query={destination}
                visible={showDestDrop && !destCode}
                onSelect={(code, city) => { setDestCode(code); setDestination(city); setShowDestDrop(false); }}
              />
            </AnimatePresence>
          </div>

          {!compact && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-3">Date</label>
              <div className={inputCls}>
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <input type="date" className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          )}

          {!compact && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-3">Passagers</label>
              <div className={inputCls}>
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <select className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 outline-none" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} passager{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className={cn(!compact && "flex items-end")}>
            <button
              type="submit"
              className={cn(
                "w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800",
                "text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30",
                "flex items-center justify-center gap-2 active:scale-[0.98]",
                compact ? "px-6 py-3 text-sm" : "px-6 py-3.5 mt-1 text-sm",
              )}
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
