"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightCard } from "@/components/FlightCard";
import { FlightCardSkeleton } from "@/components/LoadingSkeleton";
import { fetchFlights } from "@/lib/api-client";
import type { FlightOffer } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown, Plane, AlertTriangle, Wifi } from "lucide-react";
import { cn } from "@/lib/cn";

type SortKey = "price" | "duration" | "departure";
type StopsFilter = "all" | "direct" | "1stop";

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "CDG";
  const to = searchParams.get("to") || "JFK";
  const date = searchParams.get("date") || undefined;
  const pax = parseInt(searchParams.get("pax") || "1");

  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchFlights({ origin: from, destination: to, date, passengers: pax })
      .then((data) => {
        setFlights(data.flights);
        setDataSource(data.source);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [from, to, date, pax]);

  const filtered = flights
    .filter((f) => {
      if (stopsFilter === "direct") return f.stops === 0;
      if (stopsFilter === "1stop") return f.stops <= 1;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price.amount - b.price.amount;
      if (sortBy === "departure") return a.departure.at.localeCompare(b.departure.at);
      return a.durationMinutes - b.durationMinutes;
    });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "price", label: "Prix" },
    { key: "departure", label: "Départ" },
    { key: "duration", label: "Durée" },
  ];

  const stopsOptions: { key: StopsFilter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "direct", label: "Direct" },
    { key: "1stop", label: "1 escale max" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-dark-950">
      <Navbar />

      <div className="pt-20 pb-4 px-4 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto">
          <FlightSearchForm compact />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary-500" />
              {from} → {to}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {loading
                ? "Recherche en cours..."
                : error
                  ? "Erreur"
                  : `${filtered.length} vol${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
              {dataSource === "mock" && !loading && !error && (
                <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  Données simulées
                </span>
              )}
              {dataSource === "duffel" && !loading && !error && (
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 inline-flex">
                  <Wifi className="w-3 h-3" /> Duffel
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center mb-6"
          >
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-red-700 dark:text-red-300 mb-1">Erreur de recherche</p>
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {!error && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" /> Trier:
              </div>
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    sortBy === opt.key
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300",
                  )}
                >
                  {opt.label}
                </button>
              ))}
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Escales:
              </div>
              {stopsOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStopsFilter(opt.key)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    stopsFilter === opt.key
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200"
                      : "bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <FlightCardSkeleton key={i} index={i} />
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((flight, i) => (
                    <FlightCard key={flight.id} flight={flight} index={i} />
                  ))}
                </AnimatePresence>
              )}

              {!loading && filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <p className="text-lg font-semibold text-slate-400">Aucun vol ne correspond à vos critères</p>
                  <p className="text-sm text-slate-300 dark:text-slate-500 mt-1">Essayez de modifier vos filtres</p>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
