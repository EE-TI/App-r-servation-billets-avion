"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Trip } from "./types";

interface TripsContextType {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id" | "bookedAt">) => void;
  cancelTrip: (id: string) => void;
}

const TripsContext = createContext<TripsContextType | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("skyvoyage_trips");
    if (stored) {
      try {
        setTrips(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const addTrip = useCallback((trip: Omit<Trip, "id" | "bookedAt">) => {
    setTrips((prev) => {
      const newTrip: Trip = {
        ...trip,
        id: crypto.randomUUID(),
        bookedAt: new Date().toISOString(),
      };
      const updated = [newTrip, ...prev];
      localStorage.setItem("skyvoyage_trips", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const cancelTrip = useCallback((id: string) => {
    setTrips((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, status: "cancelled" as const } : t,
      );
      localStorage.setItem("skyvoyage_trips", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <TripsContext.Provider value={{ trips, addTrip, cancelTrip }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used within TripsProvider");
  return ctx;
}
