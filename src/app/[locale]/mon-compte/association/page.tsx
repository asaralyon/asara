export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { getJwtSecret } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AssociationDashboard from '@/components/association/AssociationDashboard';

export default async function AssociationAccountPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const isRTL = locale === 'ar';

  const token = cookies().get('token')?.value;
  if (!token) redirect(`/${locale}/connexion`);

  let user;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { associationProfile: true },
    });
    if (!user) redirect(`/${locale}/connexion`);
    if (user.role !== 'ASSOCIATION') redirect(`/${locale}/mon-compte`);
  } catch {
    redirect(`/${locale}/connexion`);
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <section className="section">
        <div className="container-app">
          <div className="mb-6">
            <Link
              href={`/${locale}/mon-compte`}
              className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              {isRTL ? 'حسابي' : 'Mon compte'}
            </Link>
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
  <div>
    <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
      {isRTL ? 'لوحة تحكم الجمعية' : 'Tableau de bord Association'}
    </h1>
    <p className={`text-neutral-600 mt-1 ${isRTL ? 'text-right' : ''}`}>
      {user.associationProfile?.associationName}
    </p>
  </div>
  <Link
    href={`/${locale}/mon-compte/modifier-association`}
    className="btn-secondary flex items-center gap-2 text-sm"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
    {isRTL ? 'تعديل الملف' : 'Modifier le profil'}
  </Link>
</div>

          <AssociationDashboard
            locale={locale}
            associationProfile={user.associationProfile}
          />
        </div>
        </div>
      </section>
    </main>
  );
}