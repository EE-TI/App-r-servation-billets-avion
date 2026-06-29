"use client";

import { motion } from "framer-motion";
import { Clock, Leaf, PlaneTakeoff, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { FlightOffer } from "@/lib/types";
import { formatDuration } from "@/lib/types";
import { cn } from "@/lib/cn";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    const match = iso.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : iso;
  }
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function FlightCard({ flight, index }: { flight: FlightOffer; index: number }) {
  const isCheapest = index === 0;
  const depTime = formatTime(flight.departure.at);
  const arrTime = formatTime(flight.arrival.at);
  const duration = formatDuration(flight.durationMinutes);

  const href = `/booking?id=${encodeURIComponent(flight.id)}&from=${flight.departure.airport}&to=${flight.arrival.airport}&price=${flight.price.amount}&currency=${flight.price.currency}&dep=${depTime}&arr=${arrTime}&airline=${encodeURIComponent(flight.airline.name)}&iata=${flight.airline.iataCode}&duration=${encodeURIComponent(duration)}&stops=${flight.stops}&durationMin=${flight.durationMinutes}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={href}>
        <div
          className={cn(
            "group bg-white dark:bg-dark-800 rounded-2xl border transition-all duration-200 cursor-pointer",
            "hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5",
            isCheapest
              ? "border-green-200 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900/50"
              : "border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700",
          )}
        >
          {isCheapest && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-t-2xl text-center">
              Meilleur prix
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:w-36">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {flight.airline.iataCode || flight.airline.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{flight.airline.name}</p>
                  <p className="text-xs text-slate-400">{flight.id.slice(0, 10)}</p>
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{depTime}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{flight.departure.airport}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 px-2">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />{duration}
                  </span>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full" />
                    <PlaneTakeoff className="w-3.5 h-3.5 text-primary-500" />
                  </div>
                  <span className={cn("text-[11px] font-semibold", flight.stops === 0 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                    {flight.stops === 0 ? "Direct" : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{arrTime}</p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{flight.arrival.airport}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-36 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 sm:pl-6">
                {flight.co2Kg && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Leaf className="w-3 h-3" /><span>{Math.round(flight.co2Kg)} kg CO₂</span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {Math.round(flight.price.amount)}
                    <span className="text-base font-bold text-slate-400"> {flight.price.currency === "EUR" ? "€" : flight.price.currency}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">par personne</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
