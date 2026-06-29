"use client";

import { motion } from "framer-motion";

export function FlightCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 animate-pulse">
        <div className="flex items-center gap-3 sm:w-36">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="w-20 h-3 bg-slate-200 rounded-full" />
            <div className="w-14 h-2 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-4">
          <div className="w-16 h-6 bg-slate-200 rounded-lg" />
          <div className="flex-1 h-[2px] bg-slate-100 rounded-full" />
          <div className="w-16 h-6 bg-slate-200 rounded-lg" />
        </div>
        <div className="sm:w-36 flex flex-col items-end gap-2">
          <div className="w-12 h-3 bg-slate-100 rounded-full" />
          <div className="w-20 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}
