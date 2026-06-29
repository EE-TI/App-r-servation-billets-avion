"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  ArrowLeft,
  Plane,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") || "CDG";
  const to = searchParams.get("to") || "JFK";
  const price = Number(searchParams.get("price")) || 299;
  const dep = searchParams.get("dep") || "08:30";
  const arr = searchParams.get("arr") || "18:45";
  const airline = searchParams.get("airline") || "Air France";
  const duration = searchParams.get("duration") || "7h 15";
  const stops = Number(searchParams.get("stops")) || 0;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const taxes = Math.round(price * 0.12);
  const total = price + taxes;

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    router.push(
      `/success?from=${from}&to=${to}&price=${total}&airline=${encodeURIComponent(airline)}&dep=${dep}&arr=${arr}&name=${encodeURIComponent(form.firstName + " " + form.lastName)}`,
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => (step === 1 ? setStep(0) : router.back())}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Steps indicator */}
          <div className="flex items-center gap-3 mb-8">
            {["Informations", "Paiement"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    i <= step
                      ? "bg-primary-600 text-white"
                      : "bg-slate-200 text-slate-400",
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    i <= step ? "text-slate-800" : "text-slate-400",
                  )}
                >
                  {label}
                </span>
                {i === 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            {/* Form */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  {step === 0 ? (
                    <>
                      <h2 className="text-xl font-extrabold text-slate-900 mb-6">
                        Informations du passager
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InputField
                          icon={User}
                          label="Prénom"
                          value={form.firstName}
                          onChange={(v) => update("firstName", v)}
                          required
                        />
                        <InputField
                          icon={User}
                          label="Nom"
                          value={form.lastName}
                          onChange={(v) => update("lastName", v)}
                          required
                        />
                        <InputField
                          icon={Mail}
                          label="Email"
                          type="email"
                          value={form.email}
                          onChange={(v) => update("email", v)}
                          required
                        />
                        <InputField
                          icon={Phone}
                          label="Téléphone"
                          type="tel"
                          value={form.phone}
                          onChange={(v) => update("phone", v)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-extrabold text-slate-900 mb-6">
                        Informations de paiement
                      </h2>
                      <div className="space-y-4">
                        <InputField
                          icon={CreditCard}
                          label="Numéro de carte"
                          value={form.cardNumber}
                          onChange={(v) => update("cardNumber", v)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            icon={CreditCard}
                            label="Expiration"
                            value={form.expiry}
                            onChange={(v) => update("expiry", v)}
                            placeholder="MM/AA"
                            required
                          />
                          <InputField
                            icon={Lock}
                            label="CVV"
                            value={form.cvv}
                            onChange={(v) => update("cvv", v)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                        <Lock className="w-3 h-3" />
                        Paiement sécurisé par cryptage SSL 256-bit
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "w-full mt-8 py-4 rounded-2xl font-bold text-white text-sm transition-all",
                      "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800",
                      "shadow-lg shadow-primary-500/25 hover:shadow-xl",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      "active:scale-[0.99]",
                    )}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement en cours...
                      </span>
                    ) : step === 0 ? (
                      "Continuer vers le paiement"
                    ) : (
                      `Payer ${total} €`
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Booking summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Résumé du vol
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{dep}</p>
                    <p className="text-xs font-bold text-slate-400">{from}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center mx-4">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {duration}
                    </span>
                    <div className="w-full h-[2px] bg-gradient-to-r from-primary-300 to-primary-500 rounded-full my-1" />
                    <span className="text-[10px] font-semibold text-green-600">
                      {stops === 0 ? "Direct" : `${stops} escale`}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{arr}</p>
                    <p className="text-xs font-bold text-slate-400">{to}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-3 border-t border-slate-100">
                  <Plane className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-slate-600">
                    {airline}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Billet</span>
                    <span className="font-semibold">{price} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Taxes & frais</span>
                    <span className="font-semibold">{taxes} €</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold pt-2 border-t border-dashed border-slate-200">
                    <span>Total</span>
                    <span className="text-primary-600">{total} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InputField({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
        {label}
      </label>
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
        <Icon className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="bg-transparent w-full text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none"
        />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  );
}
