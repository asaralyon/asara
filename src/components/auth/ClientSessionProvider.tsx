'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isRefreshing = useRef(false);
  const lastCheck = useRef(0);

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    if (isRefreshing.current) return false;
    isRefreshing.current = true;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        router.refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [router]);

  const checkSession = useCallback(async () => {
    // Throttle : max une vérification toutes les 30 secondes
    const now = Date.now();
    if (now - lastCheck.current < 30000) return;
    lastCheck.current = now;

    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.status === 401) {
        await tryRefresh();
      }
    } catch {
      // Erreur réseau temporaire — silencieux
    }
  }, [tryRefresh]);

  // Vérification au changement de route (throttlée)
  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  // Refresh proactif toutes les 13 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      tryRefresh();
    }, 13 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tryRefresh]);

  return <>{children}</>;
}
