"use client";

import { motion } from "framer-motion";
import { Clock, Leaf, PlaneTakeoff, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Flight } from "@/lib/flight-service";
import { cn } from "@/lib/cn";

export function FlightCard({
  flight,
  index,
}: {
  flight: Flight;
  index: number;
}) {
  const isCheapest = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={`/booking?flight=${flight.id}&from=${flight.origin}&to=${flight.destination}&price=${flight.price}&dep=${flight.departureTime}&arr=${flight.arrivalTime}&airline=${encodeURIComponent(flight.airline)}&duration=${encodeURIComponent(flight.duration)}&stops=${flight.stops}`}>
        <div
          className={cn(
            "group bg-white rounded-2xl border transition-all duration-200 cursor-pointer",
            "hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5",
            isCheapest
              ? "border-green-200 ring-1 ring-green-100"
              : "border-slate-200 hover:border-primary-200",
          )}
        >
          {isCheapest && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-t-2xl text-center">
              Meilleur prix
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              {/* Airline */}
              <div className="flex items-center gap-3 sm:w-36">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {flight.airline.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    {flight.airline}
                  </p>
                  <p className="text-xs text-slate-400">{flight.id}</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex-1 flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {flight.departureTime}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {flight.origin}
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1 px-2">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {flight.duration}
                  </span>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full" />
                    <PlaneTakeoff className="w-3.5 h-3.5 text-primary-500" />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      flight.stops === 0
                        ? "text-green-600"
                        : "text-amber-600",
                    )}
                  >
                    {flight.stops === 0
                      ? "Direct"
                      : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {flight.destination}
                  </p>
                </div>
              </div>

              {/* Price + CO2 */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-36 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Leaf className="w-3 h-3" />
                  <span>{flight.co2} kg CO₂</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">
                    {flight.price}
                    <span className="text-base font-bold text-slate-400">
                      {" "}€
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">par personne</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
