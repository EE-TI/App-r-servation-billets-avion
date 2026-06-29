"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { CheckCircle2, Plane, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "CDG";
  const to = searchParams.get("to") || "JFK";
  const price = searchParams.get("price") || "299";
  const airline = searchParams.get("airline") || "Air France";
  const dep = searchParams.get("dep") || "08:30";
  const arr = searchParams.get("arr") || "18:45";
  const name = searchParams.get("name") || "Jean Dupont";
  const seat = searchParams.get("seat") || "12A";
  const gate = searchParams.get("gate") || "B19";
  const ticketId = searchParams.get("ticket") || `SKV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-dark-950">
      <Navbar />

      <div className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
              Réservation confirmée !
            </h1>
            <p className="text-slate-400">
              Votre billet a été envoyé par email. Bon voyage !
            </p>
          </motion.div>

          {/* Boarding pass */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  <span className="font-extrabold text-lg tracking-wide">BOARDING PASS</span>
                </div>
                <span className="text-sm font-mono text-primary-200">{ticketId}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{from}</p>
                  <p className="text-xs text-slate-400 mt-1">{dep}</p>
                </div>
                <div className="flex-1 flex items-center justify-center mx-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-slate-300 dark:bg-slate-600 rounded-full" />
                    <Plane className="w-5 h-5 text-primary-500" />
                    <div className="w-8 h-[2px] bg-slate-300 dark:bg-slate-600 rounded-full" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{to}</p>
                  <p className="text-xs text-slate-400 mt-1">{arr}</p>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 my-6 relative">
                <div className="absolute -left-8 -top-3 w-6 h-6 bg-slate-50 dark:bg-dark-950 rounded-full" />
                <div className="absolute -right-8 -top-3 w-6 h-6 bg-slate-50 dark:bg-dark-950 rounded-full" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passager</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Compagnie</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{airline}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Siège</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1 text-lg">{seat}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Porte</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1 text-lg">{gate}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400">Total payé</span>
                <span className="text-2xl font-black text-primary-600">{price} €</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <button className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors text-sm">
              <Download className="w-4 h-4" /> Télécharger le billet
            </button>
            <Link
              href="/trips"
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-3 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm"
            >
              Voir mes voyages
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
