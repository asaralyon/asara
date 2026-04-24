'use client';

import { useState, useEffect } from 'react';
import { Archive, FileText, X, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface NewsletterArchiveItem {
  id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  htmlContent: string | null;
}

interface Props {
  locale: string;
}

export default function NewsletterArchive({ locale }: Props) {
  const isRTL = locale === 'ar';
  const [archives, setArchives] = useState<NewsletterArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArchive, setSelectedArchive] = useState<NewsletterArchiveItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/newsletter/archives')
      .then(r => r.json())
      .then(data => {
        setArchives(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  if (archives.length === 0) return null;

  return (
    <>
      <section className="card" dir={isRTL ? 'rtl' : 'ltr'}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={"w-full flex items-center justify-between " + (isRTL ? 'flex-row-reverse' : '')}
        >
          <h2 className={"text-xl font-bold flex items-center gap-3 " + (isRTL ? 'flex-row-reverse' : '')}>
            <Archive className="w-6 h-6 text-primary-600" />
            {isRTL ? 'أرشيف النشرات' : 'Archives des newsletters'}
            <span className="text-sm font-normal text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {archives.length}
            </span>
          </h2>
          {isOpen
            ? <ChevronUp className="w-5 h-5 text-neutral-400" />
            : <ChevronDown className="w-5 h-5 text-neutral-400" />
          }
        </button>

        {isOpen && (
          <div className="mt-6 space-y-3">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className={"flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-transparent hover:border-primary-200 hover:bg-primary-50 transition-all " + (isRTL ? 'flex-row-reverse' : '')}
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className={"flex-1 min-w-0 " + (isRTL ? 'text-right' : '')}>
                  <p className="font-semibold text-neutral-800 truncate text-sm">
                    {formatDate(archive.sentAt)}
                  </p>
                  <div className={"flex items-center gap-3 mt-1 text-xs text-neutral-500 " + (isRTL ? 'flex-row-reverse justify-end' : '')}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {archive.recipientCount} {isRTL ? 'مستلم' : 'destinataires'}
                    </span>
                  </div>
                </div>
                {archive.htmlContent && (
                  <button
                    onClick={() => setSelectedArchive(archive)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    {isRTL ? 'عرض' : 'Consulter'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedArchive && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
            <div className={"flex items-center justify-between p-5 border-b " + (isRTL ? 'flex-row-reverse' : '')}>
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-bold text-lg text-neutral-900">
                  {isRTL ? 'النشرة الأسبوعية' : 'Newsletter du'} {formatDate(selectedArchive.sentAt)}
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {selectedArchive.recipientCount} {isRTL ? 'مستلم' : 'destinataires'}
                </p>
              </div>
              <button
                onClick={() => setSelectedArchive(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="p-4">
              <iframe
                srcDoc={selectedArchive.htmlContent || ''}
                className="w-full rounded-xl border border-neutral-200"
                style={{ height: '70vh' }}
                title="Newsletter"
                sandbox="allow-same-origin"
              />
            </div>

            <div className={"flex items-center justify-end gap-3 p-5 border-t " + (isRTL ? 'flex-row-reverse' : '')}>
              <button
                onClick={() => setSelectedArchive(null)}
                className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
              <button
                onClick={() => {
                  const win = window.open('', '_blank');
                  if (win && selectedArchive.htmlContent) {
                    win.document.write(selectedArchive.htmlContent);
                    win.document.close();
                  }
                }}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isRTL ? 'فتح في نافذة جديدة' : 'Ouvrir dans un nouvel onglet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
