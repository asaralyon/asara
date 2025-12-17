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
    case 'SANA':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'وزارة الخارجية السورية':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'سوريا نيوز':
      return { bg: 'bg-pink-100', text: 'text-pink-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

function NewsCard({ item }: { item: NewsItem }) {
  const isRTL = isArabic(item.title);
  const style = getSourceStyle(item.source);
  const [imgError, setImgError] = useState(false);

  // Image par défaut = logo ASARA local
  const defaultImage = '/images/logo.png';
  
  // Utiliser l'image de l'article ou l'image par défaut
  const imageUrl = (!item.image || imgError) ? defaultImage : item.image;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(isRTL ? 'ar-SY' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Image */}
      <div className="w-32 sm:w-48 flex-shrink-0 bg-neutral-100">
        <img 
          src={imageUrl}
          alt={item.title}
          className={`w-full h-full object-cover ${(!item.image || imgError) ? 'object-contain p-4' : ''}`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col p-4">
        <div className={`mb-2 ${style.bg} ${style.text} px-3 py-1 rounded-full text-xs font-semibold inline-block self-start`}>
          {item.source}
        </div>

        <p className="font-medium leading-relaxed hover:text-primary-500 flex-1 line-clamp-3">
          {item.title}
        </p>

        <div className="mt-4 flex justify-between items-center border-t pt-3 text-sm text-neutral-500">
          <span>{formatDate(item.pubDate)}</span>
          <ExternalLink className="w-4 h-4" />
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
      setLoading(true);
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

    const interval = setInterval(fetchNews, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );

  if (error || news.length === 0)
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow">
        <p className="text-neutral-500 mb-4">
          Impossible de charger les actualités
        </p>
        <button
          onClick={fetchNews}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {news.map((item, index) => (
        <NewsCard key={index} item={item} />
      ))}
    </div>
  );
}

export default NewsSection;
