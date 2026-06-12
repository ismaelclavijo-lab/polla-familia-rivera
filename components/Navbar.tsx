"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Pronosticar", icon: "🎯" },
    { href: "/mis-resultados", label: "Mis resultados", icon: "📊" },
    { href: "/ranking", label: "Ranking", icon: "🏆" },
    { href: "/reglas", label: "Cómo jugar", icon: "📖" },
  ];

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
            <span className="text-lg">⚽</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs text-slate-500 font-medium">Familia Rivera Arcos</p>
            <p className="text-sm font-bold text-white">Mundial 2026</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {navLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === href
                  ? "text-orange-400 bg-orange-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="hidden md:inline">{label}</span>
              <span className="md:hidden text-base">{icon}</span>
              {pathname === href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-400">{nombre}</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-xs text-slate-600 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
