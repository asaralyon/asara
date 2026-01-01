'use client';

import { useState, useRef } from 'react';
import { Loader2, Send, Users, Briefcase, CheckCircle, AlertCircle, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

interface EmailCampaignFormProps {
  locale: string;
}

interface CampaignImage {
  id: string;
  base64: string;
  caption: string;
}

export default function EmailCampaignForm({ locale }: EmailCampaignFormProps) {
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [images, setImages] = useState<CampaignImage[]>([]);
  const [imageCaption, setImageCaption] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    target: 'all',
    subject: '',
    message: '',
    includeHeader: true,
    includeFooter: true,
  });

  // Templates prédéfinis
  const templates = [
    {
      id: 'event',
      name: isRTL ? 'دعوة لحدث' : 'Invitation événement',
      subject: isRTL ? 'دعوة خاصة - ASARA' : 'Invitation spéciale - ASARA',
      message: isRTL 
        ? 'يسعدنا دعوتكم لحضور [اسم الحدث] الذي سيقام في [التاريخ] في [المكان].\n\nنتطلع لرؤيتكم!'
        : 'Nous avons le plaisir de vous inviter à [NOM DE L\'ÉVÉNEMENT] qui aura lieu le [DATE] à [LIEU].\n\nNous espérons vous y voir nombreux !',
    },
    {
      id: 'news',
      name: isRTL ? 'أخبار الجمعية' : 'Actualités association',
      subject: isRTL ? 'أخبار ASARA' : 'Actualités ASARA',
      message: isRTL
        ? 'أعزاءنا الأعضاء،\n\nنود مشاركتكم آخر أخبار جمعيتنا:\n\n[المحتوى]\n\nشكراً لدعمكم المستمر!'
        : 'Chers membres,\n\nNous souhaitons partager avec vous les dernières nouvelles de notre association :\n\n[CONTENU]\n\nMerci pour votre soutien continu !',
    },
    {
      id: 'reminder',
      name: isRTL ? 'تذكير بالاشتراك' : 'Rappel cotisation',
      subject: isRTL ? 'تذكير - تجديد اشتراككم' : 'Rappel - Renouvellement de votre adhésion',
      message: isRTL
        ? 'نذكركم بأن اشتراككم سينتهي قريباً. نرجو تجديده للاستمرار في الاستفادة من خدماتنا.'
        : 'Nous vous rappelons que votre adhésion arrive bientôt à échéance. Merci de procéder au renouvellement pour continuer à bénéficier de nos services.',
    },
    {
      id: 'course',
      name: isRTL ? 'دورة تدريبية' : 'Formation / Cours',
      subject: isRTL ? 'دورة تدريبية جديدة - ASARA' : 'Nouvelle formation - ASARA',
      message: isRTL
        ? 'نعلن عن تنظيم دورة تدريبية حول [الموضوع].\n\nالتاريخ: [التاريخ]\nالمكان: [المكان]\nالسعر: [السعر]\n\nللتسجيل، يرجى الرد على هذا البريد.'
        : 'Nous organisons une formation sur [SUJET].\n\nDate : [DATE]\nLieu : [LIEU]\nTarif : [PRIX]\n\nPour vous inscrire, veuillez répondre à cet email.',
    },
    {
      id: 'holiday',
      name: isRTL ? 'تهنئة بالعيد' : 'Vœux / Fêtes',
      subject: isRTL ? 'تهنئة من ASARA' : 'Vœux de ASARA',
      message: isRTL
        ? 'بمناسبة [المناسبة]، نتقدم لكم بأحر التهاني وأطيب الأمنيات.\n\nكل عام وأنتم بخير!'
        : 'À l\'occasion de [OCCASION], nous vous adressons nos meilleurs vœux.\n\nBien cordialement,\nL\'équipe ASARA',
    },
  ];

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        message: template.message,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setResult({ success: false, message: isRTL ? 'الملف غير صالح. اختر صورة.' : 'Fichier non valide. Selectionnez une image.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setResult({ success: false, message: isRTL ? 'الصورة كبيرة جداً. الحد الأقصى 2 ميجابايت.' : 'Image trop lourde. Maximum 2 Mo.' });
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: CampaignImage = {
          id: Date.now().toString(),
          base64,
          caption: imageCaption || ''
        };
        setImages([...images, newImage]);
        setImageCaption('');
        setResult({ success: true, message: isRTL ? 'تمت إضافة الصورة!' : 'Image ajoutee!' });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setResult({ success: false, message: isRTL ? 'خطأ في تحميل الصورة' : 'Erreur upload image' });
    }
    setUploadingImage(false);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setResult({ success: false, message: isRTL ? 'يرجى ملء جميع الحقول' : 'Veuillez remplir tous les champs' });
      return;
    }

    const confirmed = window.confirm(
      isRTL 
        ? 'هل أنت متأكد من إرسال هذا البريد الإلكتروني؟' 
        : 'Êtes-vous sûr de vouloir envoyer cet email ?'
    );
    
    if (!confirmed) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, images }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ 
          success: true, 
          message: isRTL 
            ? `تم إرسال ${data.sent} رسالة بنجاح` 
            : `${data.sent} emails envoyés avec succès`,
          count: data.sent,
        });
        // Reset form
        setFormData({ ...formData, subject: '', message: '' });
        setImages([]);
      } else {
        setResult({ success: false, message: data.error || 'Erreur' });
      }
    } catch {
      setResult({ success: false, message: isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion' });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {/* Templates */}
      <div className="mb-6">
        <label className="label">{isRTL ? 'قوالب جاهزة' : 'Modèles prédéfinis'}</label>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Destinataires */}
      <div className="mb-6">
        <label className="label">{isRTL ? 'المستلمون' : 'Destinataires'} *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.target === 'all' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300'}`}>
            <input
              type="radio"
              name="target"
              value="all"
              checked={formData.target === 'all'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="sr-only"
            />
            <Users className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-medium">{isRTL ? 'الكل' : 'Tous'}</p>
              <p className="text-xs text-neutral-500">{isRTL ? 'جميع المستخدمين' : 'Tous les utilisateurs'}</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.target === 'professionals' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300'}`}>
            <input
              type="radio"
              name="target"
              value="professionals"
              checked={formData.target === 'professionals'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="sr-only"
            />
            <Briefcase className="w-5 h-5 text-secondary-600" />
            <div>
              <p className="font-medium">{isRTL ? 'المحترفين' : 'Professionnels'}</p>
              <p className="text-xs text-neutral-500">{isRTL ? 'فقط المحترفين' : 'Uniquement pros'}</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.target === 'members' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300'}`}>
            <input
              type="radio"
              name="target"
              value="members"
              checked={formData.target === 'members'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="sr-only"
            />
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">{isRTL ? 'الأعضاء' : 'Membres'}</p>
              <p className="text-xs text-neutral-500">{isRTL ? 'فقط الأعضاء' : 'Uniquement membres'}</p>
            </div>
          </label>

          <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${formData.target === 'active' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300'}`}>
            <input
              type="radio"
              name="target"
              value="active"
              checked={formData.target === 'active'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="sr-only"
            />
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">{isRTL ? 'النشطين' : 'Actifs'}</p>
              <p className="text-xs text-neutral-500">{isRTL ? 'الحسابات النشطة' : 'Comptes actifs'}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Sujet */}
      <div className="mb-6">
        <label className="label">{isRTL ? 'الموضوع' : 'Sujet'} *</label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="input"
          placeholder={isRTL ? 'موضوع البريد الإلكتروني' : 'Sujet de l\'email'}
        />
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="label">{isRTL ? 'الرسالة' : 'Message'} *</label>
        <textarea
          required
          rows={10}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="input font-mono text-sm"
          placeholder={isRTL ? 'محتوى الرسالة...' : 'Contenu du message...'}
        />
        <p className="text-xs text-neutral-500 mt-2">
          {isRTL 
            ? 'يمكنك استخدام {firstName} لإدراج اسم المستلم' 
            : 'Vous pouvez utiliser {firstName} pour insérer le prénom du destinataire'}
        </p>
      </div>

      {/* Images */}
      <div className="mb-6">
        <label className="label flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          {isRTL ? 'الصور' : 'Images'} ({images.length})
        </label>
        
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img 
                  src={img.base64} 
                  alt={img.caption || 'Image'} 
                  className="w-full h-24 object-cover rounded-lg"
                />
                {img.caption && (
                  <p className="text-xs text-neutral-500 mt-1 truncate">{img.caption}</p>
                )}
                <button 
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            placeholder={isRTL ? 'وصف الصورة (اختياري)' : 'Légende (optionnel)'}
            className="input flex-1 text-sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="btn-secondary flex items-center gap-2"
          >
            {uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isRTL ? 'إضافة' : 'Ajouter'}
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          {isRTL ? 'الحد الأقصى 2 ميجابايت لكل صورة' : 'Max 2 Mo par image'}
        </p>
      </div>

      {/* Options */}
      <div className="mb-6 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.includeHeader}
            onChange={(e) => setFormData({ ...formData, includeHeader: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-300"
          />
          <span className="text-sm">{isRTL ? 'إضافة رأس ASARA' : 'Inclure en-tête ASARA'}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.includeFooter}
            onChange={(e) => setFormData({ ...formData, includeFooter: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-300"
          />
          <span className="text-sm">{isRTL ? 'إضافة تذييل ASARA' : 'Inclure pied de page ASARA'}</span>
        </label>
      </div>

      {/* Résultat */}
      {result && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isRTL ? 'جاري الإرسال...' : 'Envoi en cours...'}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {isRTL ? 'إرسال الحملة' : 'Envoyer la campagne'}
          </>
        )}
      </button>
    </form>
  );
}
