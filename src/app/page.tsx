"use client";

import { Navbar } from "@/components/Navbar";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { DestinationCard } from "@/components/DestinationCard";
import { popularDestinations } from "@/lib/flight-service";
import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";

const features = [
  { icon: Shield, title: "Paiement sécurisé", desc: "Transactions 100% protégées" },
  { icon: Clock, title: "Support 24/7", desc: "Assistance à tout moment" },
  { icon: CreditCard, title: "Meilleurs prix", desc: "Garantie du prix le plus bas" },
  { icon: Headphones, title: "Service client", desc: "Équipe dédiée et réactive" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar transparent />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900" />
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22/%3E%3C/svg%3E')]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-4">
              Votre prochain voyage
              <br />
              <span className="text-primary-200">commence ici</span>
            </h1>
            <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
              Comparez des centaines de vols et trouvez le billet parfait au
              meilleur prix. Simple, rapide, fiable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FlightSearchForm />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">{f.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Destinations populaires
              </h2>
              <p className="text-slate-400 mt-2">
                Les destinations préférées de nos voyageurs
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularDestinations.map((dest, i) => (
              <DestinationCard key={dest.code} {...dest} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-extrabold mb-2">
            Sky<span className="text-primary-400">Voyage</span>
          </p>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} SkyVoyage. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}
