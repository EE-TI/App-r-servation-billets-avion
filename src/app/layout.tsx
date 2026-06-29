import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { TripsProvider } from "@/lib/trips-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyVoyage — Réservation de billets d'avion",
  description: "Trouvez et réservez vos billets d'avion au meilleur prix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <TripsProvider>{children}</TripsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
