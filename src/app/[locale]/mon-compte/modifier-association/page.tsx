import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import EditAssociationForm from '@/components/forms/EditAssociationForm';

export const dynamic = "force-dynamic";

export default async function EditAssociationPage({ params }: { params: { locale: string } }) {
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
        <div className="container-app max-w-2xl">
          <div className="mb-8">
            <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'تعديل معلومات الجمعية' : 'Modifier les informations de l\'association'}
            </h1>
          </div>
          <EditAssociationForm user={user} locale={locale} />
        </div>
      </section>
    </main>
  );
}