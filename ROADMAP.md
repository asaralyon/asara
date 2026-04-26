# 🗺️ ASARA France — Roadmap Technique & Produit
## Document de référence CTO — Vivant et mis à jour en continu

> **Dernière mise à jour :** Avril 2026  
> **Statut global :** ✅ Phase 1 terminée — 🟡 Phase 2 en cours
> **Dernière mise à jour :** 25 Avril 2026  
> **Stack :** Next.js 14 · Prisma · Neon PostgreSQL · Vercel · Stripe · Cloudinary

---

## 📊 Tableau de bord

| Domaine | Score actuel | Objectif | Statut |
|---|---|---|---|
| Sécurité | 35% | 95% | 🔴 Critique |
| Performance | 50% | 95% | 🟡 En cours |
| Mobile / PWA | 15% | 99% | 🔴 Non démarré |
| Features produit | 70% | 100% | 🟡 En cours |
| UX / UI | 45% | 99% | 🟡 En cours |
| Tests & qualité | 10% | 80% | 🔴 Critique |

---

## 🏗️ Architecture actuelle

```
asara-france/
├── src/app/[locale]/          # Pages Next.js (FR + AR, RTL natif)
│   ├── admin/                 # Dashboard admin (RBAC)
│   ├── annuaire/              # Annuaire professionnels
│   ├── annuaire-associations/ # Annuaire associations
│   ├── forum/                 # Forum communautaire
│   ├── evenements/            # Événements
│   ├── newsletter/            # Newsletter
│   └── mon-compte/            # Espace membre
├── src/app/api/               # 35 routes API REST
├── src/components/            # Composants React réutilisables
├── src/lib/                   # Auth, email, prisma, utils
├── prisma/schema.prisma       # Modèles BDD (PostgreSQL Neon)
└── public/                    # Assets statiques
```

**Rôles utilisateurs :** `ADMIN` · `PROFESSIONAL` · `MEMBER` · `ASSOCIATION`  
**Internationalisation :** Français + Arabe (RTL) via next-intl  
**Déploiement :** GitHub → Vercel (auto-deploy sur push main)

---

## 🔴 PHASE 1 — Sécurité critique & stabilité
### Durée estimée : 3 semaines
### Statut : ✅ TERMINÉE le 25/04/2026

---

### 1.1 Failles critiques immédiates

#### ✅ FAILLE #1 — Fallback secret JWT hardcodé — RÉGLÉE le 25/04/2026
**Fichier :** `src/app/api/auth/login/route.ts`  
**Problème :** `process.env.JWT_SECRET || 'secret-key'` — si JWT_SECRET n'est pas défini, n'importe qui peut forger un token valide.  
**Risque :** Compromission totale de tous les comptes utilisateurs.

**Correction :**
```typescript
// AVANT (dangereux)
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');

// APRÈS (sécurisé)
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
```
**Fichiers à corriger :** `auth/login/route.ts` · `auth/reset-password/route.ts` · `src/middleware.ts` · `src/lib/auth.ts`

- [x] Corriger tous les fallbacks JWT_SECRET (26 fichiers corrigés)
- [x] Vérifier que JWT_SECRET est bien défini sur Vercel
- [x] Créer src/lib/jwt.ts — helper centralisé getJwtSecret()

---

#### ✅ FAILLE #2 — Rate limiting — RÉGLÉE le 25/04/2026
**Problème :** Les endpoints `/api/auth/login`, `/api/auth/register`, `/api/contact` sont totalement exposés aux attaques par force brute et spam.  
**Risque :** Brute force des mots de passe, spam de formulaires, coût Neon/Vercel explosif.

**Solution recommandée :** Upstash Redis (gratuit jusqu'à 10k req/jour)

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const rateLimitAuth = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 tentatives / 15 min
});

export const rateLimitAPI = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req / min
});
```

**Variables Vercel à ajouter :**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

- [x] Créer compte Upstash (gratuit)
- [x] Installer `@upstash/ratelimit @upstash/redis`
- [x] Appliquer sur `/api/auth/*` · `/api/contact` · `/api/forum/*`
- [x] Ajouter variables sur Vercel
- [x] src/lib/rate-limit.ts créé avec 3 limiteurs (auth/api/public)

---

#### ✅ FAILLE #3 — JWT sans refresh token — RÉGLÉE le 25/04/2026
**Problème :** Token d'accès valide 7 jours, sans rotation. Si un token est volé, l'attaquant a 7 jours d'accès.  
**Solution :** Access token 15min + Refresh token 7j avec rotation.

```typescript
// Nouveau flow :
// 1. Login → access_token (15min) + refresh_token (7j, httpOnly cookie)
// 2. Requête expirée → client appelle /api/auth/refresh
// 3. /api/auth/refresh → nouveau access_token + nouveau refresh_token (rotation)
// 4. Logout → révoque refresh_token en BDD
```

**Nouveaux modèles Prisma à ajouter :**
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([userId])
  @@map("refresh_tokens")
}
```

- [x] Ajouter modèle RefreshToken au schema Prisma
- [x] Créer `/api/auth/refresh` route avec rotation
- [x] Modifier login — access token 15min + refresh token 7j
- [x] Logout révoque le refresh token en BDD

---

#### ✅ FAILLE #4 — Headers de sécurité HTTP — RÉGLÉE le 25/04/2026
**Fichier :** `next.config.js`  
**Problème :** Pas de Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.

```javascript
// next.config.js — ajouter :
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

- [x] Ajouter headers de sécurité dans next.config.js
- [x] HSTS, X-Frame-Options, XSS Protection, CSP, Referrer-Policy

---

### 1.2 Monitoring & observabilité

#### Sentry (erreurs)
- [ ] Créer compte Sentry (gratuit 5k erreurs/mois)
- [ ] Installer `@sentry/nextjs`
- [ ] Configurer `sentry.client.config.ts` et `sentry.server.config.ts`
- [ ] Ajouter `SENTRY_DSN` sur Vercel
- [ ] Alertes email sur erreurs critiques

#### Analytics (trafic)
- [ ] Activer Vercel Analytics (inclus dans le plan)
- [ ] Ou installer Plausible Analytics (open source, RGPD-friendly)

---

### 1.3 Tests critiques

#### Tests API auth
```bash
# Installer les dépendances de test
npm install --save-dev supertest @types/supertest
```

- [ ] Test login valide → token émis
- [ ] Test login invalide → 401
- [ ] Test rate limit → 429 après 5 tentatives
- [ ] Test token expiré → 401

---

## 🟡 PHASE 2 — Performance & PWA
### Durée estimée : 4 semaines
### Statut : 🔴 Non démarré

---

### 2.1 Cache Redis (Upstash)

**Objectif :** Réduire les requêtes BDD de 80% sur les pages les plus consultées.

```typescript
// Exemple : cache de l'annuaire (TTL 5 minutes)
const cacheKey = `directory:${category}:${city}:${page}`;
const cached = await redis.get(cacheKey);
if (cached) return NextResponse.json(JSON.parse(cached));

const data = await prisma.professionalProfile.findMany({ ... });
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
```

**Pages à mettre en cache :**
- [ ] Annuaire professionnels (TTL 5min)
- [ ] Annuaire associations (TTL 5min)
- [ ] Liste des événements (TTL 10min)
- [ ] Catégories forum (TTL 1h)
- [ ] Threads forum populaires (TTL 2min)

---

### 2.2 Correction des N+1 queries Prisma

**Problème identifié :** Plusieurs pages chargent les données utilisateur en boucle.

```typescript
// AVANT (N+1)
const threads = await prisma.forumThread.findMany();
for (const thread of threads) {
  thread.author = await prisma.user.findUnique({ where: { id: thread.authorId } });
}

// APRÈS (1 query)
const threads = await prisma.forumThread.findMany({
  include: { author: { select: { id: true, firstName: true, lastName: true } } }
});
```

- [ ] Audit de toutes les routes API avec Prisma Studio
- [ ] Corriger les N+1 dans `/api/forum/threads`
- [ ] Corriger les N+1 dans `/api/admin/users`
- [ ] Ajouter des index Prisma sur les champs fréquemment filtrés

---

### 2.3 PWA (Progressive Web App)

**Objectif :** L'application s'installe sur mobile comme une vraie app, fonctionne offline.

```typescript
// public/sw.js — Service Worker basique
const CACHE_NAME = 'asara-v1';
const STATIC_ASSETS = ['/', '/fr/forum', '/fr/annuaire', '/images/logo.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
});
```

**Fichiers à créer/modifier :**
- [ ] `public/sw.js` — Service Worker
- [ ] `public/manifest.json` — Déjà en place, compléter les icônes
- [ ] Ajouter meta tags PWA dans `layout.tsx`
- [ ] Tester avec Lighthouse (objectif score 90+)

---

### 2.4 Push notifications Web

**Objectif :** Notifier les membres des nouvelles réponses dans le forum, nouveaux événements.

```typescript
// Bibliothèque : web-push
// Événements à notifier :
// - Nouvelle réponse à une discussion suivie
// - Nouvel événement publié
// - Nouvelle annonce dans une catégorie suivie (Phase 3)
```

- [ ] Installer `web-push`
- [ ] Créer modèle `PushSubscription` en BDD
- [ ] Créer `/api/push/subscribe` et `/api/push/send`
- [ ] Intégrer dans le forum (nouvelles réponses)
- [ ] Intégrer dans les événements

---

### 2.5 Optimisation images

- [ ] Migrer toutes les images vers Next.js `<Image>` avec `priority` pour le LCP
- [ ] Configurer Cloudinary pour auto-format WebP/AVIF
- [ ] Lazy loading sur les images de l'annuaire
- [ ] Objectif : LCP < 2.5s, CLS < 0.1

---

## 🟢 PHASE 3 — Petites annonces & messagerie
### Durée estimée : 6 semaines
### Statut : 🔴 Non démarré

---

### 3.1 Modèle de données

**Nouveaux modèles Prisma à créer :**

```prisma
model Listing {
  id          String        @id @default(cuid())
  title       String
  description String        @db.Text
  price       Float?
  isFree      Boolean       @default(false)
  condition   String?       // Neuf, Bon état, Occasion
  category    String
  status      ListingStatus @default(PENDING)
  slug        String        @unique
  
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  
  city        String?
  postalCode  String?
  
  images      ListingImage[]
  messages    ListingMessage[]
  
  views       Int           @default(0)
  isDeleted   Boolean       @default(false)
  expiresAt   DateTime?
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@index([category])
  @@index([status])
  @@index([authorId])
  @@map("listings")
}

enum ListingStatus {
  PENDING   // En attente de modération
  ACTIVE    // Publiée
  SOLD      // Vendue / pourvue
  EXPIRED   // Expirée (30 jours)
  REJECTED  // Refusée par l'admin
}

model ListingImage {
  id        String  @id @default(cuid())
  url       String
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  order     Int     @default(0)
  @@map("listing_images")
}

model ListingMessage {
  id          String   @id @default(cuid())
  content     String   @db.Text
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  senderId    String
  sender      User     @relation("MessageSender", fields: [senderId], references: [id])
  receiverId  String
  receiver    User     @relation("MessageReceiver", fields: [receiverId], references: [id])
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([listingId])
  @@index([senderId])
  @@index([receiverId])
  @@map("listing_messages")
}
```

---

### 3.2 Features petites annonces

**Pages à créer :**
- [ ] `/[locale]/annonces` — Liste des annonces avec filtres
- [ ] `/[locale]/annonces/[slug]` — Détail d'une annonce
- [ ] `/[locale]/annonces/nouvelle` — Créer une annonce
- [ ] `/[locale]/mon-compte/annonces` — Mes annonces
- [ ] `/[locale]/admin/annonces` — Modération admin

**APIs à créer :**
- [ ] `GET/POST /api/listings` — Liste + création
- [ ] `GET/PATCH/DELETE /api/listings/[id]` — Détail + modification + suppression
- [ ] `POST /api/listings/[id]/messages` — Contacter le vendeur
- [ ] `GET /api/listings/[id]/messages` — Fil de messages
- [ ] `PATCH /api/admin/listings/[id]` — Approuver/rejeter

**Règles métier :**
- Annonce visible uniquement après modération admin
- 5 photos max par annonce (via Cloudinary, déjà configuré)
- Expiration automatique après 30 jours (cron job)
- Un membre ne peut pas se contacter lui-même
- Masquer les numéros de téléphone (messagerie interne uniquement)

---

### 3.3 Messagerie privée temps réel

**Technologie :** Server-Sent Events (SSE) — plus simple que WebSocket, natif Next.js

```typescript
// /api/messages/stream/route.ts
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Polling toutes les 2 secondes pour nouveaux messages
      const interval = setInterval(async () => {
        const messages = await prisma.listingMessage.findMany({
          where: { receiverId: user.id, isRead: false },
        });
        controller.enqueue(`data: ${JSON.stringify(messages)}\n\n`);
      }, 2000);
      
      request.signal.addEventListener('abort', () => clearInterval(interval));
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

- [ ] Créer endpoint SSE pour messages en temps réel
- [ ] Badge de notification dans le header (nombre de messages non lus)
- [ ] Page `/[locale]/messages` — Centre de messagerie
- [ ] Notification email si pas de réponse après 24h

---

### 3.4 Modération & sécurité annonces

- [ ] Workflow de validation admin (PENDING → ACTIVE/REJECTED)
- [ ] Système de signalement par les utilisateurs
- [ ] Blacklist de mots clés (automatique)
- [ ] Limite : 3 annonces actives par membre, 5 pour les pros
- [ ] Intégrer dans `/[locale]/admin/annonces`

---

## 📱 PHASE 4 — App mobile iOS & Android
### Durée estimée : 10 semaines
### Statut : 🔴 Non démarré

---

### 4.1 Choix technologique

**Recommandation : React Native + Expo**

| Critère | React Native + Expo | Flutter | Swift/Kotlin natif |
|---|---|---|---|
| Réutilisation du code web | ✅ Élevée (logique + API) | ❌ Faible | ❌ Nulle |
| Courbe d'apprentissage | ✅ Faible (React déjà maîtrisé) | 🟡 Moyenne | 🔴 Élevée |
| Performance | ✅ Excellente | ✅ Excellente | ✅ Maximale |
| Time to market | ✅ Rapide | 🟡 Moyen | 🔴 Lent |
| Coût | ✅ Un seul codebase | ✅ Un seul codebase | 🔴 Deux codebases |

**Architecture cible :**
```
asara-mobile/          # Nouveau repo (monorepo possible)
├── app/               # Expo Router (file-based routing)
│   ├── (auth)/        # Login, register
│   ├── (tabs)/        # Navigation principale
│   │   ├── index.tsx  # Accueil
│   │   ├── annuaire.tsx
│   │   ├── forum.tsx
│   │   ├── annonces.tsx
│   │   └── compte.tsx
│   └── _layout.tsx
├── components/        # Composants UI mobiles
├── lib/              # API client (fetch vers asara-france.fr/api)
└── hooks/            # React hooks partagés
```

---

### 4.2 API — Adaptations pour mobile

L'API REST existante est déjà compatible. Quelques ajouts nécessaires :

- [ ] Endpoint `/api/auth/mobile/login` — retourne le token dans le body (pas cookie)
- [ ] Support header `Authorization: Bearer <token>` dans `src/lib/auth.ts`
- [ ] Pagination cursor-based pour les listes (plus performant mobile)
- [ ] Endpoint `/api/version` — pour forcer les mises à jour

---

### 4.3 Features mobiles exclusives

**UX top 1% :**
- [ ] Biométrie (Face ID / Touch ID) via `expo-local-authentication`
- [ ] Notifications push natives via `expo-notifications` + FCM
- [ ] Mode hors ligne avec sync automatique à la reconnexion
- [ ] Gestures avancées (swipe to delete, pull to refresh)
- [ ] Haptic feedback sur les interactions clés
- [ ] Dark mode automatique selon le système
- [ ] Accessibilité complète (VoiceOver / TalkBack)

**Features spécifiques :**
- [ ] Partager une annonce / un profil via le share natif iOS/Android
- [ ] QR code pour profil professionnel
- [ ] Carte géolocalisée pour l'annuaire (expo-maps)
- [ ] Scan de carte de visite pour ajouter un contact

---

### 4.4 Design System mobile

**Bibliothèques recommandées :**
- `react-native-ui-lib` ou `tamagui` — composants UI premium
- `react-native-reanimated` — animations fluides 60fps
- `expo-blur` — effets de flou (iOS style)

**Charte graphique :**
- Couleurs : identiques au web (navy `#0c2140`, vert `#0e5f3d`, or `#ac8031`)
- Typographie : System font (SF Pro sur iOS, Roboto sur Android)
- Logo : utiliser `public/images/logo.png` existant

---

### 4.5 Publication App Store & Play Store

**iOS (App Store) :**
- [ ] Compte Apple Developer (99$/an)
- [ ] Certificats de signature via Expo EAS Build
- [ ] Screenshots pour les 5 tailles d'écran requises
- [ ] Description en FR + AR
- [ ] Politique de confidentialité (déjà dans les CGU)

**Android (Google Play) :**
- [ ] Compte Google Play Console (25$ unique)
- [ ] Générer APK/AAB signé via Expo EAS
- [ ] Screenshots + feature graphic
- [ ] Conformité RGPD (déjà en place)

**Monétisation in-app :**
- [ ] Expo In-App Purchases pour les adhésions
- [ ] Bannières pub via AdMob (Google) — même logique que le web
- [ ] Annonces boostées (mise en avant des annonces, option payante)

---

## 💰 Stratégie de monétisation

### Revenus publicitaires
- **Web :** Emplacements AdSense déjà positionnés dans le forum (4 slots)
- **Mobile :** Google AdMob intégré dans les listes (annuaire, forum, annonces)
- **Objectif :** 500€/mois à 10k utilisateurs actifs

### Revenus membres
- Adhésion membre : 15€/an (déjà en place)
- Adhésion professionnel : 100€/an (déjà en place)
- Annonce boostée : 5€ / 7 jours (Phase 3)

### Revenus association
- Adhésion association : à définir (20€/an ?)
- Événement sponsorisé : à définir

---

## 🔧 Stack technique recommandée (ajouts)

| Besoin | Solution | Coût |
|---|---|---|
| Rate limiting | Upstash Redis | Gratuit (10k req/j) |
| Monitoring erreurs | Sentry | Gratuit (5k err/mois) |
| Analytics | Vercel Analytics | Inclus |
| Push web | web-push | Gratuit |
| Push mobile | Expo + FCM | Gratuit |
| App mobile | React Native + Expo | Gratuit |
| Build mobile | Expo EAS Build | Gratuit (limited) |
| App Store | Apple Developer | 99$/an |
| Play Store | Google Play Console | 25$ unique |
| **Total ajouts** | | **~125$/an** |

---

## 📋 Conventions de mise à jour de ce document

Ce document est la **mémoire technique vivante** du projet ASARA France.

**Règles de mise à jour :**
1. Chaque tâche terminée → cocher la case `[x]`
2. Chaque nouvelle feature → ajouter une section
3. Chaque bug critique → documenter la cause + correction
4. Chaque déploiement majeur → mettre à jour le statut global
5. Mettre à jour la date en haut du document

**Commandes de mise à jour du document dans le repo :**
```bash
# Après modification
git add ROADMAP.md
git commit -m "docs: mise à jour roadmap — [description]"
git push origin main
```

**Ce fichier doit vivre à la racine du repo sous le nom `ROADMAP.md`**

---

## 📝 Journal des modifications

| Date | Action | Statut |
|---|---|---|
| 25/04/2026 | Faille #1 JWT — suppression de 26 fallbacks hardcodés | ✅ |
| 25/04/2026 | Faille #2 Rate limiting — 5 routes protégées via Upstash Redis | ✅ |
| 25/04/2026 | Faille #3 Refresh tokens — rotation access 15min + refresh 7j | ✅ |
| 25/04/2026 | Faille #4 Headers HTTP sécurité — HSTS, XSS, CSP, X-Frame | ✅ |
| 25/04/2026 | **PHASE 1 COMPLÈTE** — 4 failles critiques réglées | ✅ |
| 25/04/2026 | Archive newsletter — 13 newsletters historiques | ✅ |
| 25/04/2026 | BDD synchronisée — ep-ancient-cell = prod et local | ✅ |
| 25/04/2026 | Tous les liens asara-france.fr → asara-lyon.fr | ✅ |
| 25/04/2026 | Logo ASARA France intégré sur toutes les pages | ✅ |
| 25/04/2026 | Forum bilingue FR/AR avec modération admin | ✅ |

---

*Document créé par Claude (rôle CTO) — ASARA France — Annuaire des Syriens de France*  
*Prochaine révision prévue : après complétion Phase 1*