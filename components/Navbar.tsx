"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Pronosticar" },
    { href: "/mis-resultados", label: "Mis resultados" },
    { href: "/ranking", label: "Ranking" },
    { href: "/reglas", label: "Cómo jugar" },
  ];

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1e293b] border-b border-slate-700/50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-sm leading-tight hidden sm:block">
            Familia<br />
            <span className="text-orange-400">Rivera Arcos</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-slate-400 hidden sm:block">{nombre}</span>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
