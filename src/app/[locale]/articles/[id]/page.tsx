export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';

async function getArticle(id: string) {
  return prisma.article.findUnique({ where: { id, isPublished: true } });
}

export default async function ArticlePage({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params;
  const isRTL = locale === 'ar';
  const article = await getArticle(id);
  if (!article) notFound();

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="bg-white min-h-screen">
      <div className="container-app max-w-3xl py-10">
        <Link
          href={`/${locale}`}
          className={`inline-flex items-center gap-2 text-neutral-500 hover:text-primary-600 mb-8 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          {isRTL ? 'العودة إلى الرئيسية' : "Retour à l'accueil"}
        </Link>

        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
          {isRTL ? 'من مجتمعنا' : 'De notre communauté'}
        </p>

        <h1
          className={`font-serif text-3xl sm:text-4xl font-bold leading-tight text-neutral-900 mb-6 ${isRTL ? 'text-right' : ''}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {article.title}
        </h1>

        <div className={`flex items-center gap-3 text-sm text-neutral-500 mb-8 pb-8 border-b border-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-neutral-800">{article.authorName}</span>
          <span>·</span>
          <span>{new Date(article.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <div
          className={`font-serif text-lg leading-relaxed text-neutral-800 whitespace-pre-line ${isRTL ? 'text-right' : ''}`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {article.content}
        </div>
      </div>
    </main>
  );
}
