export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
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
            <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'لوحة تحكم الجمعية' : 'Tableau de bord Association'}
            </h1>
            <p className={`text-neutral-600 mt-1 ${isRTL ? 'text-right' : ''}`}>
              {user.associationProfile?.associationName}
            </p>
          </div>

          <AssociationDashboard
            locale={locale}
            associationProfile={user.associationProfile}
          />
        </div>
      </section>
    </main>
  );
}