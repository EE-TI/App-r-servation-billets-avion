"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  city: string;
  country: string;
  code: string;
  emoji: string;
  gradient: string;
  index: number;
}

export function DestinationCard({ city, country, code, emoji, gradient, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/results?from=YUL&to=${code}&date=&pax=1`}>
        <div className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient, "transition-transform duration-500 group-hover:scale-110")} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold text-white">
                  {emoji} {city}
                </p>
                <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {country}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-white/50 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg">
                {code}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
