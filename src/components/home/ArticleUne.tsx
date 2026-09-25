interface Props {
  article: { id: string; title: string; content: string; authorName: string; createdAt: Date };
  locale: string;
  isRTL: boolean;
}

export function ArticleUne({ article, locale, isRTL }: Props) {
  const excerpt = article.content.length > 600 ? article.content.slice(0, 600).trim() + '…' : article.content;

  return (
    <section className="bg-white border-b-4 border-neutral-900">
      <div className="container-app py-8 sm:py-12">
        <div className={`flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest text-primary-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="w-6 h-px bg-primary-600" />
          {isRTL ? 'من مجتمعنا' : 'De notre communauté'}
        </div>

        <h1
          className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-neutral-900 mb-4 ${isRTL ? 'text-right' : ''}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {article.title}
        </h1>

        <div className={`grid lg:grid-cols-3 gap-8 mt-6 ${isRTL ? 'text-right' : ''}`}>
          <p className="lg:col-span-2 text-lg text-neutral-700 leading-relaxed font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            {excerpt}
          </p>
          <div className={`border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 border-neutral-200 ${isRTL ? 'lg:border-l-0 lg:border-r lg:pl-0 lg:pr-6' : ''}`}>
            <p className="text-sm text-neutral-500 uppercase tracking-wide mb-1">
              {isRTL ? 'بقلم' : 'Par'}
            </p>
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
