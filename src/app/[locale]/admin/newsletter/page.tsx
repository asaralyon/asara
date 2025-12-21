'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  Mail, 
  Calendar, 
  Newspaper, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Users,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  isPublished: boolean;
  createdAt: string;
}

interface NewsletterData {
  news: any[];
  events: any[];
  articles: Article[];
  memberCount: number;
  lastNewsletters: any[];
}

export default function NewsletterPage() {
  const router = useRouter();
  const [data, setData] = useState<NewsletterData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
    isPublished: true
  });

  useEffect(() => {
    fetchData();
    fetchArticles();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/newsletter/preview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const json = await res.json();
        setArticles(json);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse email' });
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email test envoye !' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Erreur lors de envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
    setSending(false);
  };

  const handleSendAll = async () => {
    if (!confirm('Etes-vous sur de vouloir envoyer la newsletter a ' + (data?.memberCount || 0) + ' membres ?')) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const json = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: json.message });
        fetchData();
      } else {
        setMessage({ type: 'error', text: json.error || 'Erreur lors de envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
    setSending(false);
  };

  const handleSaveArticle = async () => {
    try {
      const url = editingArticle ? '/api/articles/' + editingArticle.id : '/api/articles';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleForm)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editingArticle ? 'Article modifie' : 'Article cree' });
        setShowArticleForm(false);
        setEditingArticle(null);
        setArticleForm({ title: '', content: '', authorName: '', authorEmail: '', isPublished: true });
        fetchArticles();
        fetchData();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;

    try {
      const res = await fetch('/api/articles/' + id, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Article supprime' });
        fetchArticles();
        fetchData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      authorName: article.authorName,
      authorEmail: article.authorEmail || '',
      isPublished: article.isPublished
    });
    setShowArticleForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-app">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Newsletter</h1>
            <p className="text-neutral-600">Gerez et envoyez la newsletter hebdomadaire</p>
          </div>
          <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>

        {message && (
          <div className={'mb-6 p-4 rounded-lg ' + (message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right font-bold">×</button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Envoi */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Destinataires
              </h2>
              <p className="text-3xl font-bold text-primary-600">{data?.memberCount || 0}</p>
              <p className="text-neutral-600">membres recevront la newsletter</p>
            </div>

            {/* Envoi test */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-600" />
                Envoi test
              </h2>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="input mb-3"
              />
              <button
                onClick={handleSendTest}
                disabled={sending}
                className="btn-secondary w-full"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Envoyer un test'}
              </button>
            </div>

            {/* Envoi reel */}
            <div className="card bg-primary-50 border-2 border-primary-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-600" />
                Envoyer la newsletter
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                Envoyer a tous les {data?.memberCount || 0} membres
              </p>
              <button
                onClick={handleSendAll}
                disabled={sending}
                className="btn-primary w-full"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Envoyer a tous'}
              </button>
            </div>

            {/* Historique */}
            {data?.lastNewsletters && data.lastNewsletters.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Historique
                </h2>
                <div className="space-y-2">
                  {data.lastNewsletters.map((nl: any) => (
                    <div key={nl.id} className="text-sm p-2 bg-neutral-50 rounded">
                      <p className="font-medium">{new Date(nl.sentAt).toLocaleDateString('fr-FR')}</p>
                      <p className="text-neutral-600">{nl.recipientCount} destinataires</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite - Contenu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Actualites RSS */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary-600" />
                Actualites de Syrie (automatique)
              </h2>
              <div className="space-y-2">
                {data?.news?.slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-neutral-50 rounded-lg">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-neutral-500">{item.source}</p>
                  </div>
                )) || <p className="text-neutral-500 text-sm">Aucune actualite</p>}
              </div>
            </div>

            {/* Evenements */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Evenements a venir (automatique)
              </h2>
              {data?.events && data.events.length > 0 ? (
                <div className="space-y-2">
                  {data.events.map((event: any) => (
                    <div key={event.id} className="p-3 bg-neutral-50 rounded-lg">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                        {event.location && ' - ' + event.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Aucun evenement a venir</p>
              )}
            </div>

            {/* Articles des membres */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Articles de la communaute
                </h2>
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setArticleForm({ title: '', content: '', authorName: '', authorEmail: '', isPublished: true });
                    setShowArticleForm(true);
                  }}
                  className="btn-primary text-sm py-2 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>

              {articles.length > 0 ? (
                <div className="space-y-3">
                  {articles.map((article) => (
                    <div key={article.id} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{article.title}</p>
                            {article.isPublished ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Publie</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Brouillon</span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">Par {article.authorName}</p>
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{article.content}</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => handleEditArticle(article)} className="p-1 hover:bg-neutral-200 rounded">
                            <Edit className="w-4 h-4 text-neutral-600" />
                          </button>
                          <button onClick={() => handleDeleteArticle(article.id)} className="p-1 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Aucun article. Ajoutez-en un pour inclure dans la newsletter.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal formulaire article */}
        {showArticleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingArticle ? 'Modifier article' : 'Nouvel article'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="input"
                    placeholder="Titre de article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contenu</label>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    className="input min-h-[150px]"
                    placeholder="Contenu de article..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom de auteur</label>
                    <input
                      type="text"
                      value={articleForm.authorName}
                      onChange={(e) => setArticleForm({ ...articleForm, authorName: e.target.value })}
                      className="input"
                      placeholder="Prenom Nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email (optionnel)</label>
                    <input
                      type="email"
                      value={articleForm.authorEmail}
                      onChange={(e) => setArticleForm({ ...articleForm, authorEmail: e.target.value })}
                      className="input"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={articleForm.isPublished}
                    onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPublished" className="text-sm">
                    Publier dans la newsletter
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingArticle(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveArticle}
                  disabled={!articleForm.title || !articleForm.content || !articleForm.authorName}
                  className="btn-primary flex-1"
                >
                  {editingArticle ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
