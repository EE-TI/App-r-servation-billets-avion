"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface SeatMapProps {
  onSelect: (seat: string) => void;
  selectedSeat: string | null;
}

type SeatStatus = "available" | "occupied" | "premium" | "exit";

interface Seat {
  id: string;
  row: number;
  col: string;
  status: SeatStatus;
  price: number;
}

const COLS = ["A", "B", "C", "D", "E", "F"];
const ROWS = 20;

function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  for (let row = 1; row <= ROWS; row++) {
    for (const col of COLS) {
      const isOccupied = Math.random() < 0.35;
      const isPremium = row <= 3;
      const isExit = row === 10 || row === 11;
      seats.push({
        id: `${row}${col}`,
        row,
        col,
        status: isOccupied ? "occupied" : isPremium ? "premium" : isExit ? "exit" : "available",
        price: isPremium ? 45 : isExit ? 20 : 0,
      });
    }
  }
  return seats;
}

const initialSeats = generateSeats();

export function SeatMap({ onSelect, selectedSeat }: SeatMapProps) {
  const [seats] = useState(initialSeats);
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const hovered = seats.find((s) => s.id === hoveredSeat);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700" />
          <span className="text-slate-500 dark:text-slate-400">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700" />
          <span className="text-slate-500 dark:text-slate-400">Premium (+45€)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700" />
          <span className="text-slate-500 dark:text-slate-400">Sortie (+20€)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700" />
          <span className="text-slate-500 dark:text-slate-400">Occupé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-primary-600 border border-primary-700" />
          <span className="text-slate-500 dark:text-slate-400">Sélectionné</span>
        </div>
      </div>

      {/* Tooltip */}
      {hovered && hovered.status !== "occupied" && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          Siège <span className="font-bold">{hovered.id}</span>
          {hovered.price > 0 && (
            <span className="text-amber-600 dark:text-amber-400 ml-1">(+{hovered.price}€)</span>
          )}
        </motion.div>
      )}

      {/* Aircraft cabin */}
      <div className="relative bg-slate-50 dark:bg-dark-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden">
        {/* Fuselage top */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-1 max-w-xs mx-auto mb-2">
          {COLS.slice(0, 3).map((c) => (
            <div key={c} className="text-center text-[10px] font-bold text-slate-400">{c}</div>
          ))}
          <div />
          {COLS.slice(3).map((c) => (
            <div key={c} className="text-center text-[10px] font-bold text-slate-400">{c}</div>
          ))}
        </div>

        {/* Seats grid */}
        <div className="space-y-1 max-w-xs mx-auto">
          {Array.from({ length: ROWS }, (_, rowIdx) => {
            const row = rowIdx + 1;
            const rowSeats = seats.filter((s) => s.row === row);
            const isExitRow = row === 10 || row === 11;

            return (
              <div key={row} className="relative">
                {isExitRow && row === 10 && (
                  <div className="text-[9px] text-center text-green-600 dark:text-green-400 font-bold mb-1 uppercase tracking-wider">
                    Sortie de secours
                  </div>
                )}
                <div className="grid grid-cols-[repeat(3,1fr)_1.5rem_repeat(3,1fr)] gap-1 items-center">
                  {rowSeats.slice(0, 3).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      selected={selectedSeat === seat.id}
                      onSelect={onSelect}
                      onHover={setHoveredSeat}
                    />
                  ))}
                  <div className="text-center text-[9px] font-bold text-slate-300 dark:text-slate-600">
                    {row}
                  </div>
                  {rowSeats.slice(3).map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      selected={selectedSeat === seat.id}
                      onSelect={onSelect}
                      onHover={setHoveredSeat}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fuselage bottom */}
        <div className="flex justify-center mt-3">
          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  onSelect,
  onHover,
}: {
  seat: Seat;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const isOccupied = seat.status === "occupied";

  return (
    <motion.button
      type="button"
      disabled={isOccupied}
      whileHover={!isOccupied ? { scale: 1.15 } : undefined}
      whileTap={!isOccupied ? { scale: 0.95 } : undefined}
      onClick={() => !isOccupied && onSelect(seat.id)}
      onMouseEnter={() => onHover(seat.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "aspect-square rounded-md text-[9px] font-bold transition-colors",
        isOccupied && "bg-slate-200 dark:bg-slate-700 cursor-not-allowed",
        !isOccupied && !selected && seat.status === "available" && "bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700 hover:bg-primary-200 dark:hover:bg-primary-800/50 cursor-pointer text-primary-700 dark:text-primary-300",
        !isOccupied && !selected && seat.status === "premium" && "bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/50 cursor-pointer text-amber-700 dark:text-amber-300",
        !isOccupied && !selected && seat.status === "exit" && "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 cursor-pointer text-green-700 dark:text-green-300",
        selected && "bg-primary-600 border border-primary-700 text-white shadow-lg shadow-primary-500/30",
      )}
    >
      {isOccupied ? "" : selected ? "✓" : ""}
    </motion.button>
  );
}
