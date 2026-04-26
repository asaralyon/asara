'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ClientSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Tente de rafraîchir le token access via le refresh token
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

  // Vérifie /api/auth/me — si 401, tente un refresh, sinon déconnecte
  const checkAndRefreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (res.ok) return; // Token encore valide, rien à faire

      if (res.status === 401) {
        // Token expiré → tenter refresh
        const refreshed = await tryRefresh();
        if (refreshed) {
          // Refresh réussi → le nouveau token est dans le cookie
          // On force un re-render du Header via router.refresh()
          router.refresh();
        }
        // Si refresh échoue → l'utilisateur sera redirigé par le middleware
        // lors de la prochaine navigation vers une page protégée
      }
    } catch {
      // Erreur réseau — on ne déconnecte pas, peut être temporaire
    }
  }, [router, tryRefresh]);

  // Vérification au montage et à chaque changement de route
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