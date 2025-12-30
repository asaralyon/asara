'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  locale: string;
}

export default function DeleteAccountButton({ locale }: Props) {
  const router = useRouter();
  const isRTL = locale === 'ar';
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expectedText = isRTL ? 'حذف' : 'SUPPRIMER';

  const handleDelete = async () => {
    if (confirmText !== expectedText) {
      setError(isRTL ? 'يرجى كتابة "حذف" للتأكيد' : 'Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/' + locale);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || (isRTL ? 'حدث خطأ' : 'Une erreur est survenue'));
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
      >
        <Trash2 className="w-5 h-5" />
        {isRTL ? 'حذف حسابي' : 'Supprimer mon compte'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {isRTL ? 'حذف الحساب' : 'Supprimer le compte'}
              </h3>
            </div>

            <p className="text-neutral-600 mb-4">
              {isRTL 
                ? 'هذا الإجراء لا رجعة فيه. سيتم حذف جميع بياناتك نهائياً.'
                : 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.'}
            </p>

            <p className="text-neutral-700 mb-2 font-medium">
              {isRTL 
                ? 'لتأكيد الحذف، اكتب "حذف" أدناه:'
                : 'Pour confirmer, tapez "SUPPRIMER" ci-dessous :'}
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText('');
                  setError('');
                }}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors font-medium"
              >
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== expectedText}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                {isRTL ? 'حذف نهائي' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
