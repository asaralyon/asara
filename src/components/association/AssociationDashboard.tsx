'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Calendar, MapPin, Loader2, CheckCircle,
  AlertCircle, Clock, XCircle, Trash2, Upload,
  Image as ImageIcon, FileText, X,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  eventDate: string | null;
  location: string | null;
  status: string;
  isPublished: boolean;
  imageUrl1: string | null;
  documentUrl: string | null;
  createdAt: string;
}

interface AssociationDashboardProps {
  locale: string;
  associationProfile: any;
}

function StatusBadge({ status, locale }: { status: string; locale: string }) {
  const isRTL = locale === 'ar';

  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
        <Clock className="w-3 h-3" />
        {isRTL ? 'في الانتظار' : 'En attente'}
      </span>
    );
  }
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        {isRTL ? 'مقبول' : 'Approuvé'}
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        <XCircle className="w-3 h-3" />
        {isRTL ? 'مرفوض' : 'Refusé'}
      </span>
    );
  }
  return null;
}

export default function AssociationDashboard({ locale, associationProfile }: AssociationDashboardProps) {
  const isRTL = locale === 'ar';
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const fileInputDoc = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'GALLERY' as 'GALLERY' | 'DOCUMENT',
    eventDate: '',
    location: '',
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    documentUrl: '',
  });

  const texts = {
    myEvents: isRTL ? 'فعالياتي' : 'Mes événements',
    addEvent: isRTL ? 'إضافة فعالية' : 'Ajouter un événement',
    noEvents: isRTL ? 'لا توجد فعاليات بعد' : 'Aucun événement pour le moment',
    noEventsDesc: isRTL
      ? 'أضف فعاليتك الأولى وسيقوم المشرف بمراجعتها.'
      : 'Ajoutez votre premier événement, il sera examiné par l\'administrateur.',
    title: isRTL ? 'العنوان' : 'Titre',
    description: isRTL ? 'الوصف' : 'Description',
    date: isRTL ? 'التاريخ' : 'Date',
    location: isRTL ? 'المكان' : 'Lieu',
    type: isRTL ? 'نوع المحتوى' : 'Type de contenu',
    gallery: isRTL ? 'معرض صور' : 'Galerie photos',
    document: isRTL ? 'وثيقة' : 'Document',
    submit: isRTL ? 'إرسال للمراجعة' : 'Envoyer pour validation',
    cancel: isRTL ? 'إلغاء' : 'Annuler',
    image1: isRTL ? 'الصورة الأولى *' : 'Image 1 *',
    image2: isRTL ? 'الصورة الثانية (اختياري)' : 'Image 2 (optionnel)',
    image3: isRTL ? 'الصورة الثالثة (اختياري)' : 'Image 3 (optionnel)',
    uploadImage: isRTL ? 'رفع صورة' : 'Télécharger',
    uploadDoc: isRTL ? 'رفع وثيقة' : 'Télécharger le document',
    pendingInfo: isRTL
      ? 'سيتم مراجعة فعاليتك من قبل المشرف قبل نشرها.'
      : 'Votre événement sera examiné par l\'administrateur avant d\'être publié.',
    deleteConfirm: isRTL
      ? 'هل تريد حذف هذه الفعالية؟'
      : 'Supprimer cet événement ?',
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/association/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpload = async (
    file: File,
    field: 'imageUrl1' | 'imageUrl2' | 'imageUrl3' | 'documentUrl'
  ) => {
    setUploadingImage(field);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur upload' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur upload' });
    }
    setUploadingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: isRTL ? 'العنوان مطلوب' : 'Le titre est requis' });
      return;
    }
    if (formData.type === 'GALLERY' && !formData.imageUrl1) {
      setMessage({ type: 'error', text: isRTL ? 'الصورة الأولى مطلوبة' : 'L\'image 1 est requise' });
      return;
    }
    if (formData.type === 'DOCUMENT' && !formData.documentUrl) {
      setMessage({ type: 'error', text: isRTL ? 'الوثيقة مطلوبة' : 'Le document est requis' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/association/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: isRTL
            ? 'تم إرسال الفعالية للمراجعة بنجاح!'
            : 'Événement envoyé pour validation !',
        });
        setShowForm(false);
        setFormData({
          title: '', description: '', type: 'GALLERY',
          eventDate: '', location: '',
          imageUrl1: '', imageUrl2: '', imageUrl3: '', documentUrl: '',
        });
        fetchEvents();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setMessage({ type: 'error', text: isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm(texts.deleteConfirm)) return;
    try {
      const res = await fetch('/api/association/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        fetchEvents();
        setMessage({
          type: 'success',
          text: isRTL ? 'تم حذف الفعالية' : 'Événement supprimé',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const UploadButton = ({
    field,
    accept,
    inputRef,
    currentUrl,
    label,
  }: {
    field: 'imageUrl1' | 'imageUrl2' | 'imageUrl3' | 'documentUrl';
    accept: string;
    inputRef: React.RefObject<HTMLInputElement>;
    currentUrl: string;
    label: string;
  }) => (
    <div>
      <label className="label">{label}</label>
      {currentUrl ? (
        <div className="relative inline-block">
          {field === 'documentUrl' ? (
            <div className="w-24 h-24 bg-primary-100 rounded-xl flex flex-col items-center justify-center">
              <FileText className="w-8 h-8 text-primary-500" />
              <span className="text-xs text-primary-600 mt-1">PDF</span>
            </div>
          ) : (
            <img src={currentUrl} alt="" className="w-24 h-24 object-cover rounded-xl" />
          )}
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, [field]: '' }))}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          {uploadingImage === field ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
              <span className="text-xs text-neutral-500">{texts.uploadImage}</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, field);
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
          }
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          {texts.myEvents}
          <span className="text-sm font-normal text-neutral-500">({events.length})</span>
        </h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {texts.addEvent}
          </button>
        )}
      </div>

      {/* Note info */}
      <div className={`flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>{texts.pendingInfo}</p>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-5 border-2 border-primary-200">
          <h3 className={`font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
            {texts.addEvent}
          </h3>

          <div>
            <label className="label">{texts.title} *</label>
            <input
              type="text" required value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder={isRTL ? 'عنوان الفعالية' : 'Titre de l\'événement'}
            />
          </div>

          <div>
            <label className="label">{texts.description}</label>
            <textarea
              rows={4} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              placeholder={isRTL ? 'وصف الفعالية...' : 'Description de l\'événement...'}
              maxLength={1000}
            />
            <p className="text-xs text-neutral-400 mt-1">{formData.description.length}/1000</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{texts.date}</label>
              <input
                type="date" value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">{texts.location}</label>
              <input
                type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder={isRTL ? 'المدينة، المكان...' : 'Ville, lieu...'}
              />
            </div>
          </div>

          {/* Type de contenu */}
          <div>
            <label className="label">{texts.type}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'GALLERY' })}
                className={`p-4 rounded-xl border-2 transition-colors text-left ${
                  formData.type === 'GALLERY'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <ImageIcon className="w-5 h-5 mb-1 text-primary-500" />
                <p className="font-medium text-sm">{texts.gallery}</p>
                <p className="text-xs text-neutral-500">{isRTL ? 'حتى 3 صور' : 'Max 3 photos'}</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DOCUMENT' })}
                className={`p-4 rounded-xl border-2 transition-colors text-left ${
                  formData.type === 'DOCUMENT'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <FileText className="w-5 h-5 mb-1 text-primary-500" />
                <p className="font-medium text-sm">{texts.document}</p>
                <p className="text-xs text-neutral-500">PDF / {isRTL ? 'صورة' : 'image'}</p>
              </button>
            </div>
          </div>

          {/* Upload images ou document */}
          {formData.type === 'GALLERY' ? (
            <div className="grid sm:grid-cols-3 gap-4">
              <UploadButton
                field="imageUrl1" accept="image/*"
                inputRef={fileInputRef1}
                currentUrl={formData.imageUrl1}
                label={texts.image1}
              />
              <UploadButton
                field="imageUrl2" accept="image/*"
                inputRef={fileInputRef2}
                currentUrl={formData.imageUrl2}
                label={texts.image2}
              />
              <UploadButton
                field="imageUrl3" accept="image/*"
                inputRef={fileInputRef3}
                currentUrl={formData.imageUrl3}
                label={texts.image3}
              />
            </div>
          ) : (
            <UploadButton
              field="documentUrl"
              accept="application/pdf,image/*"
              inputRef={fileInputDoc}
              currentUrl={formData.documentUrl}
              label={texts.uploadDoc}
            />
          )}

          {/* Boutons */}
          <div className={`flex gap-3 pt-4 border-t border-neutral-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => { setShowForm(false); setMessage(null); }}
              className="btn-secondary"
            >
              {texts.cancel}
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isRTL ? 'جاري الإرسال...' : 'Envoi...'}</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> {texts.submit}</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Liste événements */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="font-medium text-neutral-600">{texts.noEvents}</p>
          <p className="text-sm text-neutral-500 mt-1">{texts.noEventsDesc}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="card">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Miniature */}
                <div className={`flex items-start gap-4 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {event.imageUrl1 ? (
                    <img
                      src={event.imageUrl1}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : event.documentUrl ? (
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-primary-500" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-neutral-400" />
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <StatusBadge status={event.status} locale={locale} />
                    </div>
                    <div className={`flex flex-wrap gap-3 text-sm text-neutral-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {event.eventDate && (
                        <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR')}
                        </span>
                      )}
                      {event.location && (
                        <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {isRTL ? 'أرسل في' : 'Envoyé le'}{' '}
                      {new Date(event.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {event.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors flex-shrink-0"
                    title={isRTL ? 'حذف' : 'Supprimer'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Message refus */}
              {event.status === 'REJECTED' && (
                <div className={`mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm ${isRTL ? 'text-right' : ''}`}>
                  {isRTL
                    ? 'لم يتم قبول هذه الفعالية. يمكنك حذفها وإعادة الإرسال.'
                    : 'Cet événement n\'a pas été approuvé. Vous pouvez le supprimer et en soumettre un nouveau.'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}