import Link from 'next/link';

interface Props {
  article: { id: string; title: string; content: string; authorName: string; createdAt: Date };
  locale: string;
  isRTL: boolean;
}

export function ArticleUne({ article, locale, isRTL }: Props) {
  const excerpt = article.content.length > 600 ? article.content.slice(0, 600).trim() + '…' : article.content;
  const href = `/${locale}/articles/${article.id}`;

  return (
    <section className="bg-white border-b-4 border-neutral-900">
      <div className="container-app py-8 sm:py-12">
        <div className={`flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest text-primary-600 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="w-6 h-px bg-primary-600" />
          {isRTL ? 'من مجتمعنا' : 'De notre communauté'}
        </div>

        <Link href={href}>
          <h1
            className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-neutral-900 mb-4 hover:text-primary-700 transition-colors cursor-pointer break-words ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {article.title}
          </h1>
        </Link>

        <div className={`flex flex-col lg:flex-row gap-8 mt-6 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          <Link href={href} className="lg:flex-1 group order-2 lg:order-none">
            <p
              className={`text-lg text-neutral-700 leading-relaxed font-serif break-words ${isRTL ? 'text-right' : 'text-left'}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {excerpt}
            </p>
            <span className="inline-block mt-3 text-sm font-semibold text-primary-600 group-hover:underline">
              {isRTL ? 'قراءة المزيد ←' : 'Lire la suite →'}
            </span>
          </Link>

          <div className={`lg:w-56 flex-shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-200 ${isRTL ? 'lg:border-r lg:pr-6 text-right' : 'lg:border-l lg:pl-6 text-left'}`}>
            <p className="text-sm text-neutral-500 uppercase tracking-wide mb-1">{isRTL ? 'بقلم' : 'Par'}</p>
            <p className="font-semibold text-neutral-900">{article.authorName}</p>
            <p className="text-sm text-neutral-400 mt-1">
              {new Date(article.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
