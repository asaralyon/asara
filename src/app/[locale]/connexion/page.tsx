import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { LoginForm } from '@/components/forms/LoginForm';

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const token = cookies().get('token')?.value;
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
      await jwtVerify(token, secret);
      // Token valide → redirect vers compte
      redirect(`/${locale}/mon-compte`);
    } catch {
      // Token invalide → on continue et affiche la page
      // Le cookie sera supprimé au prochain login
      console.log('Invalid token on connexion page, showing login form');
    }
  }

  const t = await getTranslations('auth.login');

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
          </div>
          <LoginForm locale={locale} />
          <div className="mt-6 text-center text-sm">
            <span>{t('noAccount')}</span>{' '}
            
              href={`/${locale}/adhesion`}
              className="text-secondary-500 hover:text-secondary-600 font-semibold"
            >
              {t('register')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
