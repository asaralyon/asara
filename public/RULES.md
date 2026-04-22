# ASARA France — Règles du projet

## Stack technique
- Next.js 14 App Router, TypeScript
- PostgreSQL (Neon) + Prisma ORM
- JWT auth (jose), Tailwind CSS
- Vercel (hosting), Cloudinary (uploads)
- next-intl (FR/AR bilingue)

---

## 1. Mobile-first OBLIGATOIRE

Chaque composant commence par le mobile, puis sm:, md:, lg:.
Utiliser les classes Tailwind dans cet ordre :
`classe-mobile sm:classe-tablette md:classe-desktop lg:classe-large`

### Grilles
```tsx
// ✅ Correct
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

// ❌ Incorrect
<div className="grid grid-cols-3 gap-6">
```

### Boutons
```tsx
// ✅ Correct — pleine largeur mobile, auto desktop
<button className="btn-primary w-full sm:w-auto">

// ❌ Incorrect
<button className="btn-primary">
```

### Typographie
```tsx
// ✅ Correct
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
<p className="text-sm sm:text-base">

// ❌ Incorrect
<h1 className="text-4xl font-bold">
```

### Formulaires
```tsx
// ✅ Correct — stack sur mobile, côte à côte sur desktop
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// ❌ Incorrect
<div className="grid grid-cols-2 gap-4">
```

### Flex
```tsx
// ✅ Correct — colonne sur mobile, ligne sur desktop
<div className="flex flex-col sm:flex-row gap-4">

// ❌ Incorrect
<div className="flex gap-4">
```

### Cards
```tsx
// ✅ Correct
<div className="card p-4 sm:p-6">

// ❌ Incorrect
<div className="card p-6">
```

### Touch targets
- Boutons et liens : minimum 44x44px
- Pas de hover-only interactions (penser aux écrans tactiles)
- Jamais de largeur fixe en px sans responsive

---

## 2. Bilinguisme FR/AR OBLIGATOIRE

Chaque texte affiché doit avoir sa version arabe.

```tsx
// Direction sur chaque <main>
<main dir={isRTL ? 'rtl' : 'ltr'}>

// Textes inline
{isRTL ? 'نص عربي' : 'Texte français'}

// Flex RTL
<div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>

// Icônes flèches
<ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />

// Texte aligné
<h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
```

---

## 3. Schema Prisma — Database first

- Toujours modifier le schema AVANT de créer les pages
- Après chaque modification schema (dev) :
  ```bash
  npx prisma db push
  npx prisma generate
  ```
- En production : utiliser la DATABASE_URL de Vercel :
  ```bash
  DATABASE_URL="url-neon-vercel" npx prisma db push
  ```
- Ne jamais partager la DATABASE_URL dans le chat

---

## 4. Structure des fichiers

```
src/
  app/
    [locale]/
      admin/             ← pages admin (protégées)
      mon-compte/        ← pages utilisateur connecté
      annuaire/          ← annuaire professionnels
      annuaire-associations/ ← annuaire associations
      adhesion/          ← inscription membres/pros/associations
    api/
      admin/             ← API admin uniquement
      auth/              ← login, register, logout, reset
      association/       ← API spécifique associations
      user/              ← API utilisateur connecté
  components/
    admin/               ← composants admin
    association/         ← composants association
    forms/               ← formulaires réutilisables
    layout/              ← Header, Footer
    ui/                  ← composants UI de base
  lib/
    prisma.ts            ← client Prisma singleton
    email.ts             ← templates et envoi emails
    constants.ts         ← CATEGORIES, CITIES partagés
  messages/
    fr.json              ← traductions françaises
    ar.json              ← traductions arabes
```

---

## 5. Auth et rôles

- Rôles : ADMIN, PROFESSIONAL, MEMBER, ASSOCIATION
- Statuts : PENDING, ACTIVE, SUSPENDED, EXPIRED
- Vérification token JWT dans chaque route API protégée
- Middleware gère les redirections automatiquement
- Mettre à jour `publicPaths` dans `middleware.ts` pour chaque nouvelle route publique

### Redirections après login
```ts
ADMIN       → /${locale}/admin
PROFESSIONAL → /${locale}/mon-compte
MEMBER      → /${locale}/mon-compte
ASSOCIATION → /${locale}/mon-compte
```

---

## 6. API routes — pattern standard

```ts
export const dynamic = "force-dynamic";

// 1. Vérifier l'auth (JWT)
// 2. Valider les données reçues
// 3. Opération Prisma
// 4. Retourner la réponse JSON
// 5. Catch global avec console.error

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(); // toujours en premier
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    // validation...

    const result = await prisma.model.create({ data: body });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

---

## 7. Middleware — routes publiques

Fichier : `src/middleware.ts`

Ajouter chaque nouvelle route publique dans `publicPaths` :
```ts
const publicPaths = [
  '',
  'connexion',
  'adhesion',
  'annuaire',
  'annuaire-associations',  // ← exemple
  'evenements',
  'contact',
  'newsletter',
  'cgu',
  // ajouter ici les nouvelles routes publiques
];
```

---

## 8. Emails

- Tous les emails passent par `src/lib/email.ts`
- Templates dans l'objet `emailTemplates`
- Envoi non-bloquant (try/catch séparé du flux principal)
- Toujours notifier `info@asara-france.fr` pour nouvelles inscriptions

```ts
// ✅ Non-bloquant
try {
  await sendEmail({ to, subject, html });
} catch (emailError) {
  console.error('Email error (non-blocking):', emailError);
}
```

---

## 9. Déploiement

```bash
# 1. Build local OBLIGATOIRE avant chaque push
npm run build

# 2. Zéro erreur toléré avant push

# 3. Après modification schema — sync base production
DATABASE_URL="url-vercel" npx prisma db push

# 4. Push
git add .
git commit -m "type: description courte"
git push origin main
```

### Types de commits
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `chore:` tâche technique (deps, config)
- `refactor:` refactorisation sans nouvelle feature

---

## 10. Composants clés — rappel

### TikTok Icon (pas dans lucide-react)
```tsx
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}
```

### WhatsApp Icon (pas dans lucide-react)
```tsx
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
```

### Pattern page protégée (Server Component)
```tsx
export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

export default async function ProtectedPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const token = cookies().get('token')?.value;
  if (!token) redirect(`/${locale}/connexion`);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user) redirect(`/${locale}/connexion`);
  } catch {
    redirect(`/${locale}/connexion`);
  }

  return <main>...</main>;
}
```

---

## 11. PWA Ready

- Images avec `next/image` et `sizes` responsive
- `export const dynamic = "force-dynamic"` sur les pages avec données temps réel
- Lazy loading sur les composants lourds
- Éviter les imports de fonts via @import dans CSS

---

## 12. Sécurité

- Ne jamais logger ou afficher les tokens JWT
- Ne jamais partager DATABASE_URL, JWT_SECRET, ou clés API dans le chat
- Toujours valider les données côté serveur (pas seulement côté client)
- Les routes admin vérifient le rôle ADMIN côté serveur à chaque requête