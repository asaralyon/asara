'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  image: string | null;
}

function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicPattern.test(text);
}

function getSourceStyle(source: string) {
  switch (source) {
    case 'عنب بلدي':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'سانا':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'سوريا نيوز':
      return { bg: 'bg-pink-100', text: 'text-pink-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  const isRTL = isArabic(item.title);
  const style = getSourceStyle(item.source);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <a href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl border border-neutral-200 hover:shadow-md hover:border-primary-300 transition-all overflow-hidden flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {item.image ? (
        <img src={item.image}
          alt=""
          className="w-full h-40 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-40 bg-neutral-100 flex items-center justify-center">
          <span className="text-3xl">📰</span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${style.bg} ${style.text}`}>
          {item.source}
        </span>
        <p className="font-medium text-neutral-800 leading-snug line-clamp-3 flex-1 break-words">
          {item.title}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
          <span>{formatDate(item.pubDate)}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    try {
      setError(false);
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error();
      setNews(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-500 mb-3 text-sm">Impossible de charger les actualités</p>
        <button onClick={fetchNews}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mx-auto text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
      {news.map((item, index) => (
        <NewsCard key={index} item={item} />
      ))}
    </div>
  );
}

export default NewsSection;
