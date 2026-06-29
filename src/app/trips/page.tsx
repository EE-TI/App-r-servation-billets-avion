"use client";

import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useTrips } from "@/lib/trips-context";
import type { Trip } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

function TripCard({ trip, onCancel }: { trip: Trip; onCancel: () => void }) {
  const statusConfig = {
    upcoming: { label: "À venir", color: "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300" },
    completed: { label: "Terminé", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
    cancelled: { label: "Annulé", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
  };

  const status = statusConfig[trip.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Route */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {trip.from}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {trip.to}
                </span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", status.color)}>
                  {status.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {trip.airline}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {trip.departureTime} → {trip.arrivalTime}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(trip.bookedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Siège</p>
              <p className="font-bold text-slate-800 dark:text-white">{trip.seat}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Billet</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{trip.ticketId}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary-600">{trip.price}{trip.currency === "EUR" ? "€" : ` ${trip.currency || "€"}`}</p>
            </div>
            {trip.status === "upcoming" && (
              <button
                onClick={onCancel}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-1"
                title="Annuler"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const { trips, cancelTrip } = useTrips();

  if (authLoading) return null;

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-dark-950">
        <Navbar />
        <div className="pt-28 text-center px-4">
          <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Connectez-vous
          </h1>
          <p className="text-slate-400 mb-6">
            Vous devez être connecté pour voir vos voyages
          </p>
          <Link
            href="/login"
            className="inline-flex bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-dark-950">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-primary-500" />
              Mes voyages
            </h1>
            <p className="text-slate-400 mt-1">
              {trips.length} réservation{trips.length !== 1 ? "s" : ""}
            </p>
          </div>

          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Plane className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-400 mb-2">
                Aucun voyage pour l&apos;instant
              </h2>
              <p className="text-sm text-slate-300 dark:text-slate-500 mb-6">
                Commencez par rechercher un vol
              </p>
              <Link
                href="/"
                className="inline-flex bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Rechercher un vol
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onCancel={() => cancelTrip(trip.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
