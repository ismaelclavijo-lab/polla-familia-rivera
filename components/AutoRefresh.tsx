"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Silently refreshes server component data every `intervalMs` milliseconds. */
export default function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
