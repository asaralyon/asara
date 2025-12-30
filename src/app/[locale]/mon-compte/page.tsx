// src/app/[locale]/mon-compte/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import DeleteAccountButton from '@/components/DeleteAccountButton';

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  // 🔐 Vérification du token côté serveur
  const token = cookies().get('token')?.value;
  
  if (!token) {
    redirect(`/${locale}/connexion`);
  }

  let user;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    // ✅ Utiliser Prisma directement au lieu de fetch
    user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { currentPeriodEnd: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      redirect(`/${locale}/connexion`);
    }
  } catch (error) {
    console.error('Auth error in mon-compte:', error);
    redirect(`/${locale}/connexion`);
  }

  // ✅ Traductions
  const t = await getTranslations({ locale, namespace: 'account' });
  const isRTL = locale === 'ar';

  // ✅ Formater les dates
  const formatDate = (dateString: Date | null | undefined) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'Non défini';
    const date = new Date(dateString);
    if (isRTL) {
      return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ✅ Traduire la catégorie
  const translateCategory = (category: string) => {
    const categoryMap: { [key: string]: { fr: string; ar: string } } = {
      'Sante': { fr: 'Santé', ar: 'الصحة' },
      'Juridique': { fr: 'Juridique', ar: 'القانون' },
      'Finance': { fr: 'Finance', ar: 'المالية' },
      'Immobilier': { fr: 'Immobilier', ar: 'العقارات' },
      'Restauration': { fr: 'Restauration', ar: 'المطاعم' },
      'Commerce': { fr: 'Commerce', ar: 'التجارة' },
      'Artisanat': { fr: 'Artisanat', ar: 'الحرف اليدوية' },
      'Technologie': { fr: 'Technologie', ar: 'التكنولوجيا' },
      'Education': { fr: 'Éducation', ar: 'التعليم' },
      'Transport': { fr: 'Transport', ar: 'النقل' },
      'Beaute et Bien-etre': { fr: 'Beauté & Bien-être', ar: 'الجمال والعناية' },
      'Batiment': { fr: 'Construction', ar: 'البناء' },
      'Informatique': { fr: 'Technologie', ar: 'التكنولوجيا' },
      'Autre': { fr: 'Autre', ar: 'أخرى' },
    };
    
    const translation = categoryMap[category];
    return translation ? (isRTL ? translation.ar : translation.fr) : category;
  };

  const subscription = user.subscriptions[0] || null;

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="bg-gradient-to-b from-primary-50 to-white">
      <section className="section min-h-screen py-12">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">{t('title')}</h1>
            <form action="/api/auth/logout" method="POST" className="inline">
              <button
                type="submit"
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {isRTL ? 'تسجيل الخروج' : 'Déconnexion'}
              </button>
            </form>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informations personnelles */}
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-primary-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-800">{t('personalInfo')}</h2>
                </div>
                <Link href={`/${locale}/mon-compte/modifier`} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>{t('editInfo')}</span>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-neutral-700">
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500 mb-1">{t('firstName')}</span>
                  <span className="font-medium text-neutral-900">{user.firstName || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500 mb-1">{t('lastName')}</span>
                  <span className="font-medium text-neutral-900">{user.lastName || '—'}</span>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-sm text-neutral-500 mb-1">{t('email')}</span>
                  <span className="font-medium text-neutral-900">{user.email || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500 mb-1">{t('phone')}</span>
                  <span className="font-medium text-neutral-900">{user.phone || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-neutral-500 mb-1">{t('city')}</span>
                  <span className="font-medium text-neutral-900">{user.city || '—'}</span>
                </div>
                {user.address && (
                  <div className="flex flex-col sm:col-span-2">
                    <span className="text-sm text-neutral-500 mb-1">{t('address')}</span>
                    <span className="font-medium text-neutral-900">
                      {user.address}{user.postalCode && `, ${user.postalCode}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {user.role === 'PROFESSIONAL' && user.profile && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-secondary-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-800">{t('professionalInfo')}</h2>
                    </div>
                    <Link href={`/${locale}/mon-compte/modifier-professionnel`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      {isRTL ? 'تعديل' : 'Modifier'}
                    </Link>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">{t('companyName')}</span>
                      <span className="font-medium text-neutral-900">{user.profile.companyName || '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">{t('profession')}</span>
                      <span className="font-medium text-neutral-900">{user.profile.profession || '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500 mb-1">{t('category')}</span>
                      <span className="font-medium text-neutral-900">{translateCategory(user.profile.category) || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
                  <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="11" y2="11"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-800">{t('subscription')}</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">{isRTL ? 'النوع:' : 'Type'}</span>
                    <span className="font-semibold text-neutral-900">
                      {user.role === 'PROFESSIONAL' 
                        ? (isRTL ? 'مهني' : 'Professionnel')
                        : (isRTL ? 'عضو' : 'Membre')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">{isRTL ? 'السعر:' : 'Prix'}</span>
                    <span className="font-semibold text-primary-600">
                      {user.role === 'PROFESSIONAL' ? '100 €/an' : '15 €/an'}
                    </span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 mt-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">{t('membershipStart')}</span>
                    <span className="font-medium text-neutral-900">{formatDate(subscription?.currentPeriodStart)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">{t('membershipEnd')}</span>
                    <span className="font-medium text-neutral-900">{formatDate(subscription?.currentPeriodEnd)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">{t('status')}</span>
                    <span className={`font-semibold px-3 py-1 rounded-full text-xs ${subscription?.status === 'ACTIVE' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                      {subscription?.status === 'ACTIVE' 
                        ? (isRTL ? 'نشط' : 'Actif') 
                        : (isRTL ? 'غير محدد' : 'Non défini')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Suppression du compte */}
              <div className="card border-red-200 bg-red-50/50 mt-6">
                <h2 className="text-lg font-semibold text-red-700 mb-4">{isRTL ? "منطقة الخطر" : "Zone de danger"}</h2>
                <p className="text-sm text-neutral-600 mb-4">
                  {isRTL ? "حذف حسابك نهائي ولا يمكن التراجع عنه." : "La suppression de votre compte est définitive et irréversible."}
                </p>
                <DeleteAccountButton locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
