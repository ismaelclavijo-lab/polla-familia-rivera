import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polla Mundialista · Familia Rivera Arcos",
  description: "Pronostica el Mundial 2026 con la Familia Rivera Arcos. Suma puntos, sube en el ranking y vive el torneo juntos.",
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-[#0f172a] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
