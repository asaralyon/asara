# 🧠 ASARA France — Mémoire du projet
## Fichier de contexte — À lire en début de chaque session Claude

> **Dernière mise à jour :** 4 Mai 2026
> **Conversation actuelle :** Ajout pseudo utilisateur pour messagerie anonyme

---

## 🏗️ Stack technique

| Élément | Technologie |
|---|---|
| Framework | Next.js 14 App Router |
| BDD | PostgreSQL — Neon (ep-ancient-cell-ag47s3tc-pooler) |
| ORM | Prisma v5.22 |
| Auth | JWT custom (jose) + bcryptjs |
| Déploiement | GitHub → Vercel (auto-deploy sur push main) |
| Style | Tailwind CSS |
| i18n | next-intl — FR + AR (RTL natif) |
| Email | Nodemailer — SMTP Infomaniak |
| Cache | Upstash Redis |
| Analytics | Vercel Analytics |

---

## 🔑 Variables d'environnement (noms uniquement)
DATABASE_URL          → Neon ep-ancient-cell (PROD et LOCAL identiques)
JWT_SECRET            → via getJwtSecret() — jamais de fallback
UPSTASH_REDIS_REST_URL / TOKEN
SMTP_HOST/USER/PASSWORD → Infomaniak
NEXT_PUBLIC_APP_URL   → https://asara-lyon.fr
NEXT_PUBLIC_BASE_URL  → https://asara-lyon.fr
CLOUDINARY_*
STRIPE_*

---

## 📁 Architecture clés
src/
├── app/[locale]/
│   ├── admin/
│   ├── annonces/[slug]/contact/  ← messagerie annonceur
│   ├── annuaire/ + annuaire-associations/
│   ├── forum/
│   ├── newsletter/
│   └── mon-compte/modifier/      ← EditAccountForm (pseudo ICI)
├── app/api/
│   ├── auth/ (login, logout, me, refresh, register)
│   ├── forum/ (threads, replies, categories, bans)
│   ├── listings/ (annonces + messages)
│   └── newsletter/ (send, archives, preview, pdf)
├── components/
│   ├── auth/ClientSessionProvider.tsx
│   ├── forms/EditAccountForm.tsx   ← À MODIFIER
│   └── newsletter/NewsletterArchive.tsx
└── lib/
├── auth.ts      → getAuthUser() — cookie 'token'
├── jwt.ts       → getJwtSecret() — JAMAIS fallback
├── cache.ts     → getCached() — Upstash Redis
└── rate-limit.ts → rateLimitAuth / rateLimitPublic

---

## 👤 Rôles & Auth

| Rôle | Description |
|---|---|
| ADMIN | Accès total |
| PROFESSIONAL | Annuaire pros |
| MEMBER | Membre standard |
| ASSOCIATION | Profil asso + événements |

- Cookie : `token` (JWT 24h) + `refresh_token` (7j rotation)
- JWT payload : `{ userId, role }`
- `getAuthUser()` lit le cookie `token`

---

## 🗄️ Modèles Prisma — Résumé

### User (table users)
id, email, passwordHash, role, status
firstName, lastName, phone, address, city, postalCode
pseudo (String? @unique)  ← AJOUTÉ — session actuelle
newsletterOptIn, emailVerified
resetToken, resetTokenExpiry, stripeCustomerId
createdAt, updatedAt, lastLoginAt

### Autres modèles
- ProfessionalProfile, AssociationProfile
- ForumCategory, ForumThread, ForumReply, ForumBan
- Listing, ListingMessage, ListingReport
- Newsletter, Subscriber, NewsletterLink
- RefreshToken, Event, Article, Category

---

## ✅ Phases complétées

### Phase 1 — Sécurité ✅
- JWT fallback supprimé (26 fichiers) → getJwtSecret()
- Rate limiting Upstash Redis (5 routes)
- Refresh tokens rotation (24h + 7j)
- Headers HTTP sécurité (HSTS, XSS, X-Frame)

### Phase 2 — Performance & PWA ✅
- Cache Redis getCached() + forum categories TTL 1h
- PWA Service Worker (cache images) + manifest shortcuts
- Notifications email admin (inscriptions + événements)

### Phase 3 — Petites annonces ✅
- BDD : Listing, ListingMessage, ListingReport
- APIs : /api/listings, /api/listings/[id], /api/listings/[id]/messages
- Pages : liste, détail (Client Component), contact, mes annonces
- Admin : modération (approuver/refuser)
- Header : lien Annonces FR/AR

### Features additionnelles ✅
- Forum bilingue FR/AR + modération
- Archive newsletter (13 newsletters + sauvegarde HTML auto)
- Logo ASARA France partout
- Renommage asara-lyon → ASARA France
- Vercel Analytics

---

## 🔄 En cours — Session actuelle

### Pseudo utilisateur pour messagerie anonyme

**Ce qui est fait :**
- [x] Champ pseudo String? @unique dans User
- [x] npx prisma db push OK
- [x] API /api/user/update — pseudo + validation unicité

**À faire :**
- [ ] EditAccountForm.tsx — ajouter champ pseudo + traductions
- [ ] /api/listings/[id]/messages/route.ts — retourner pseudo
- [ ] /api/forum/threads/route.ts — retourner pseudo auteurs
- [ ] /api/forum/replies/route.ts — retourner pseudo auteurs
- [ ] /api/auth/me/route.ts — inclure pseudo dans réponse
- [ ] Pages forum et annonces — afficher pseudo
- [ ] src/messages/fr.json + ar.json — clés pseudo

**Logique d'affichage :**
```typescript
// src/lib/utils.ts — à ajouter
export function getDisplayName(user: {
  firstName: string;
  pseudo?: string | null;
}): string {
  return user.pseudo?.trim() || user.firstName;
}
```

---

## 🐛 Bugs connus

| Problème | Statut |
|---|---|
| Auth 401 boucle infinie | ✅ Fixé — token 24h + pause 5min |
| SW.js appendChild | ✅ Fixé — cache images uniquement |
| BDD locale ≠ prod | ✅ Fixé — toujours ep-ancient-cell |

---

## 📋 Règles du projet

### Sécurité
- Ne JAMAIS partager credentials/URLs/tokens dans le chat
- Toujours getJwtSecret() — jamais de fallback
- Cookie auth = token (pas auth-token)

### Code
- Pages i18n dans src/app/[locale]/
- Server Components par défaut
- Pages avec fetch dynamique → Client Component (évite hydration mismatch)
- export const dynamic = "force-dynamic" sur toutes les API routes
- Zod pour validation serveur

### BDD
```bash
npx prisma db push     # sync schema → prod
npx prisma generate    # régénérer client
# JAMAIS prisma migrate dev (risque reset données)
```

### Git
```bash
npm run build 2>&1 | tail -5   # vérifier avant push
git add -A && git commit -m "type: description" && git push origin main
```

---

## 💰 Monétisation

- Google AdSense — forum (4 slots) + annonces
- Adhésion membre 15€/an (Stripe actif)
- Adhésion pro 100€/an (Stripe actif)
- Annonces boostées 5€/7j (à faire)

---

## 📞 Infos projet

- Email admin : info@asara-lyon.fr
- Site : https://asara-lyon.fr
- Repo : https://github.com/asaralyon/asara
- Vercel : asara-lyon-s-projects/asara
- Neon : ep-ancient-cell-ag47s3tc

---

## 🚀 Comment reprendre une session

Commence par :
Je travaille sur ASARA France (Next.js 14 + Prisma + Neon + Vercel).
Lis CONTEXT.md à la racine du repo.
Prochaine étape : [DÉCRIRE]

---
*Mis à jour automatiquement — Claude CTO*
