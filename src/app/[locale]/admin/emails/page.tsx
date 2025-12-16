import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import EmailCampaignForm from '@/components/admin/EmailCampaignForm';

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  
  // Vérification admin
  const token = cookies().get('token')?.value;
  if (!token) {
    redirect('/' + locale + '/connexion');
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user || user.role !== 'ADMIN') {
      redirect('/' + locale + '/connexion');
    }
  } catch {
    redirect('/' + locale + '/connexion');
  }

  // Récupérer les stats
  const [totalProfessionals, totalMembers, totalActive] = await Promise.all([
    prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
  ]);

  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">
            {isRTL ? 'إرسال بريد إلكتروني جماعي' : 'Envoi d\'emails en masse'}
          </h1>
          <p className="text-neutral-600 mt-2">
            {isRTL ? 'أرسل رسائل إلى الأعضاء والمهنيين' : 'Envoyez des messages aux membres et professionnels'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{totalProfessionals}</p>
            <p className="text-sm text-neutral-600">{isRTL ? 'محترفين' : 'Professionnels'}</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-secondary-600">{totalMembers}</p>
            <p className="text-sm text-neutral-600">{isRTL ? 'أعضاء' : 'Membres'}</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{totalActive}</p>
            <p className="text-sm text-neutral-600">{isRTL ? 'نشطين' : 'Actifs'}</p>
          </div>
        </div>

        {/* Formulaire */}
        <EmailCampaignForm locale={locale} />
      </div>
    </main>
  );
}
