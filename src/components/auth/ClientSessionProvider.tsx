'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const checkAndRefreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) return;

      if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          router.refresh();
        }
      }
    } catch {
      // Erreur réseau temporaire — on ne déconnecte pas
    }
  }, [router, tryRefresh]);

  // Vérification à chaque changement de route
  useEffect(() => {
    checkAndRefreshSession();
  }, [pathname, checkAndRefreshSession]);

  // Refresh proactif toutes les 13 minutes (avant expiration des 15min)
  useEffect(() => {
    const interval = setInterval(() => {
      tryRefresh();
    }, 13 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tryRefresh]);

  return <>{children}</>;
}