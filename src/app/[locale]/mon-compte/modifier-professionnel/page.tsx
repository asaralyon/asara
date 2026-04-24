import { redirect } from 'next/navigation';
import { getJwtSecret } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getTranslations } from 'next-intl/server';
import EditProfessionalForm from '@/components/forms/EditProfessionalForm';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export default async function EditProfessionalPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const token = cookies().get('token')?.value;
  if (!token) {
    redirect(`/${locale}/connexion`);
  }

  let user;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    
    user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { profile: true },
    });

    if (!user) {
      redirect(`/${locale}/connexion`);
    }
  } catch {
    redirect(`/${locale}/connexion`);
  }

  if (user.role !== 'PROFESSIONAL') {
    redirect(`/${locale}/mon-compte`);
  }

  const t = await getTranslations({ locale, namespace: 'account' });
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="bg-gradient-to-b from-primary-50 to-white">
      <section className="section min-h-screen py-12">
        <div className="container-app max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">{t('editProfessionalInfo')}</h1>
          </div>
          <div className="card">
            <EditProfessionalForm user={user} locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
