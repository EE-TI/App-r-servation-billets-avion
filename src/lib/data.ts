import type { Airport, Destination } from "./types";

export const airports: Airport[] = [
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", name: "Orly" },
  { code: "JFK", city: "New York", name: "John F. Kennedy" },
  { code: "LHR", city: "Londres", name: "Heathrow" },
  { code: "NRT", city: "Tokyo", name: "Narita" },
  { code: "BCN", city: "Barcelone", name: "El Prat" },
  { code: "DXB", city: "Dubaï", name: "International" },
  { code: "FCO", city: "Rome", name: "Fiumicino" },
  { code: "FRA", city: "Francfort", name: "Frankfurt" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
  { code: "YUL", city: "Montréal", name: "Trudeau" },
  { code: "YYZ", city: "Toronto", name: "Pearson" },
];

export const popularDestinations: Destination[] = [
  { city: "Paris", country: "France", code: "CDG", emoji: "🇫🇷", gradient: "from-rose-400 to-orange-300" },
  { city: "Tokyo", country: "Japon", code: "NRT", emoji: "🇯🇵", gradient: "from-pink-500 to-purple-500" },
  { city: "New York", country: "États-Unis", code: "JFK", emoji: "🇺🇸", gradient: "from-blue-500 to-cyan-400" },
  { city: "Barcelone", country: "Espagne", code: "BCN", emoji: "🇪🇸", gradient: "from-amber-400 to-red-500" },
  { city: "Dubaï", country: "Émirats", code: "DXB", emoji: "🇦🇪", gradient: "from-emerald-400 to-teal-500" },
  { city: "Rome", country: "Italie", code: "FCO", emoji: "🇮🇹", gradient: "from-indigo-500 to-violet-500" },
];
