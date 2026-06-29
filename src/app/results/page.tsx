"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { FlightCard } from "@/components/FlightCard";
import { FlightCardSkeleton } from "@/components/LoadingSkeleton";
import { getFlights, type Flight } from "@/lib/flight-service";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/cn";

type SortKey = "price" | "duration" | "departure";
type StopsFilter = "all" | "direct" | "1stop";

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "CDG";
  const to = searchParams.get("to") || "JFK";

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("all");

  useEffect(() => {
    setLoading(true);
    getFlights(from, to).then((data) => {
      setFlights(data);
      setLoading(false);
    });
  }, [from, to]);

  const filtered = flights
    .filter((f) => {
      if (stopsFilter === "direct") return f.stops === 0;
      if (stopsFilter === "1stop") return f.stops <= 1;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "departure") return a.departureTime.localeCompare(b.departureTime);
      return a.duration.localeCompare(b.duration);
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
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Search bar */}
      <div className="pt-20 pb-4 px-4 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <FlightSearchForm compact />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary-500" />
              {from} → {to}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {loading
                ? "Recherche en cours..."
                : `${filtered.length} vol${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Trier:
          </div>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                sortBy === opt.key
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary-300",
              )}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Escales:
          </div>
          {stopsOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStopsFilter(opt.key)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                stopsFilter === opt.key
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Flight list */}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-lg font-semibold text-slate-400">
                Aucun vol ne correspond à vos critères
              </p>
              <p className="text-sm text-slate-300 mt-1">
                Essayez de modifier vos filtres
              </p>
            </motion.div>
          )}
        </div>
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
