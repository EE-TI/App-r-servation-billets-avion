export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  stops: number;
  price: number;
  class: string;
  aircraft: string;
  co2: number;
}

const airlines = [
  { name: "Air France", code: "AF", logo: "/airlines/air-france.svg" },
  { name: "Lufthansa", code: "LH", logo: "/airlines/lufthansa.svg" },
  { name: "British Airways", code: "BA", logo: "/airlines/british-airways.svg" },
  { name: "KLM", code: "KL", logo: "/airlines/klm.svg" },
];

const aircrafts = ["Airbus A320", "Boeing 737", "Airbus A350", "Boeing 787"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function getFlights(
  origin: string,
  destination: string,
): Promise<Flight[]> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return Array.from({ length: 10 }).map((_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const depHour = 5 + Math.floor(Math.random() * 16);
    const depMin = Math.random() > 0.5 ? 0 : 30;
    const durationH = 1 + Math.floor(Math.random() * 10);
    const durationM = Math.random() > 0.5 ? 15 : 45;
    const arrHour = (depHour + durationH + (depMin + durationM >= 60 ? 1 : 0)) % 24;
    const arrMin = (depMin + durationM) % 60;
    const stops = Math.random() > 0.6 ? (Math.random() > 0.7 ? 2 : 1) : 0;

    return {
      id: `${airline.code}-${1000 + i}`,
      airline: airline.name,
      airlineLogo: airline.logo,
      departureTime: `${pad(depHour)}:${pad(depMin)}`,
      arrivalTime: `${pad(arrHour)}:${pad(arrMin)}`,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      duration: `${durationH}h ${pad(durationM)}`,
      stops,
      price: 49 + Math.floor(Math.random() * 750),
      class: "Économique",
      aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)],
      co2: 50 + Math.floor(Math.random() * 200),
    };
  }).sort((a, b) => a.price - b.price);
}

export const popularDestinations = [
  { city: "Paris", country: "France", code: "CDG", emoji: "🇫🇷", gradient: "from-rose-400 to-orange-300" },
  { city: "Tokyo", country: "Japon", code: "NRT", emoji: "🇯🇵", gradient: "from-pink-500 to-purple-500" },
  { city: "New York", country: "États-Unis", code: "JFK", emoji: "🇺🇸", gradient: "from-blue-500 to-cyan-400" },
  { city: "Barcelone", country: "Espagne", code: "BCN", emoji: "🇪🇸", gradient: "from-amber-400 to-red-500" },
  { city: "Dubaï", country: "Émirats", code: "DXB", emoji: "🇦🇪", gradient: "from-emerald-400 to-teal-500" },
  { city: "Rome", country: "Italie", code: "FCO", emoji: "🇮🇹", gradient: "from-indigo-500 to-violet-500" },
];

export const airports = [
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
