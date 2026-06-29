"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Plane, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    const ok = await register(firstName, lastName, email, password);
    setLoading(false);
    if (ok) {
      router.push("/");
    } else {
      setError("Cet email est déjà utilisé");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Sky<span className="text-primary-600">Voyage</span>
          </span>
        </Link>

        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            Rejoignez SkyVoyage pour réserver vos vols
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Prénom
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/50 transition-all">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Nom
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/50 transition-all">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Email
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/50 transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Mot de passe
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/50 transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="bg-transparent w-full text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all",
                "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800",
                "shadow-lg shadow-primary-500/25 active:scale-[0.99]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
