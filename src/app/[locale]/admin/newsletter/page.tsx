'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Plus, Trash2, FileText, Users, 
  CheckCircle, AlertCircle, Calendar, Download, Eye
} from 'lucide-react';

interface NewsLink {
  title: string;
  url: string;
  source: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  isPublished: boolean;
}

interface Event {
  id: string;
  title: string;
  eventDate: string;
  location: string;
}

export default function NewsletterPage() {
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [customLinks, setCustomLinks] = useState<NewsLink[]>([]);
  const [newLink, setNewLink] = useState<NewsLink>({ title: '', url: '', source: '' });
  const [articles, setArticles] = useState<Article[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    authorName: 'ASARA Lyon',
    authorEmail: '',
    isPublished: true
  });
  const [history, setHistory] = useState<any[]>([]);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchPreview();
    fetchArticles();
    fetchHistory();
    const savedLinks = localStorage.getItem('newsletterLinks');
    if (savedLinks) {
      setCustomLinks(JSON.parse(savedLinks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('newsletterLinks', JSON.stringify(customLinks));
  }, [customLinks]);

  const fetchPreview = async () => {
    try {
      const res = await fetch('/api/newsletter/preview');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setRecipientCount(data.recipientCount || 0);
      }
    } catch (error) {
      console.error('Erreur preview:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Erreur articles:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/newsletter/preview');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erreur history:', error);
    }
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      if (customLinks.length >= 3) {
        setMessage({ type: 'error', text: 'Maximum 3 liens' });
        return;
      }
      setCustomLinks([...customLinks, newLink]);
      setNewLink({ title: '', url: '', source: '' });
    }
  };

  const removeLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Entrez une adresse email' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail, customLinks })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email test envoye!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
    setLoading(false);
  };

  const handleSendAll = async () => {
    if (!confirm('Envoyer la newsletter a tous les membres et inscrits?')) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLinks })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setCustomLinks([]);
        localStorage.removeItem('newsletterLinks');
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
    setLoading(false);
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLinks })
      });

      const data = await res.json();
      if (res.ok) {
        setPdfHtml(data.html);
        // Ouvrir dans une nouvelle fenêtre pour impression/PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
        setMessage({ type: 'success', text: 'PDF genere! Utilisez Ctrl+P pour sauvegarder en PDF.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
    setPdfLoading(false);
  };

  const handlePreviewPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch('/api/newsletter/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customLinks })
      });

      const data = await res.json();
      if (res.ok) {
        setPdfHtml(data.html);
      }
    } catch {
      console.error('Erreur preview');
    }
    setPdfLoading(false);
  };

  const handleSaveArticle = async () => {
    try {
      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle ? `/api/articles/${editingArticle.id}` : '/api/articles';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleForm)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editingArticle ? 'Article modifie' : 'Article cree' });
        setShowArticleForm(false);
        setEditingArticle(null);
        setArticleForm({ title: '', content: '', authorName: 'ASARA Lyon', authorEmail: '', isPublished: true });
        fetchArticles();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur reseau' });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchArticles();
        setMessage({ type: 'success', text: 'Article supprime' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur' });
    }
  };

  const editArticle = (article: Article) => {
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

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-app">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-neutral-600">Creer et envoyer la newsletter hebdomadaire</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">×</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Envoi */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold">Destinataires</h2>
              </div>
              <p className="text-3xl font-bold text-primary-600">{recipientCount}</p>
              <p className="text-sm text-neutral-500">membres et inscrits</p>
            </div>

            {/* Actions PDF */}
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Version PDF
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handlePreviewPDF}
                  disabled={pdfLoading}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Apercu
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={pdfLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Telecharger PDF
                </button>
                <p className="text-xs text-neutral-500">
                  Le PDF s'ouvrira dans une nouvelle fenetre. Utilisez Ctrl+P (ou Cmd+P) puis "Enregistrer en PDF".
                </p>
              </div>
            </div>

            {/* Envoi test */}
            <div className="card">
              <h2 className="font-semibold mb-4">Envoi test</h2>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="email@test.com"
                  className="input flex-1"
                />
                <button
                  onClick={handleSendTest}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Envoi masse */}
            <div className="card border-2 border-green-200 bg-green-50">
              <h2 className="font-semibold mb-4 text-green-700">Envoi a tous</h2>
              <button
                onClick={handleSendAll}
                disabled={loading}
                className="btn-primary w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Envoyer la newsletter
              </button>
            </div>

            {/* Historique */}
            <div className="card">
              <h2 className="font-semibold mb-4">Historique</h2>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="text-sm p-2 bg-neutral-50 rounded">
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-neutral-500">
                        {new Date(item.sentAt).toLocaleDateString('fr-FR')} - {item.recipientCount} envois
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Aucun envoi</p>
              )}
            </div>
          </div>

          {/* Colonne droite - Contenu */}
          <div className="space-y-6">
            {/* Liens personnalises */}
            <div className="card">
              <h2 className="font-semibold mb-4">Liens actualites (max 3)</h2>
              
              {customLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-neutral-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{link.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{link.url}</p>
                  </div>
                  <button onClick={() => removeLink(index)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {customLinks.length < 3 && (
                <div className="space-y-2 mt-4">
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    placeholder="Titre (en arabe)"
                    className="input text-sm"
                  />
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://..."
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    value={newLink.source}
                    onChange={(e) => setNewLink({ ...newLink, source: e.target.value })}
                    placeholder="Source (optionnel)"
                    className="input text-sm"
                  />
                  <button onClick={addLink} className="btn-secondary w-full flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              )}
            </div>

            {/* Evenements */}
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Evenements ({events.length})
              </h2>
              {events.length > 0 ? (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="text-sm p-2 bg-neutral-50 rounded">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-neutral-500">
                        {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Aucun evenement a venir</p>
              )}
              <p className="text-xs text-neutral-400 mt-2">
                Les evenements renvoient vers la page evenements du site
              </p>
            </div>

            {/* Articles */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Articles ({articles.filter(a => a.isPublished).length} publies)
                </h2>
                <button
                  onClick={() => {
                    setShowArticleForm(true);
                    setEditingArticle(null);
                    setArticleForm({ title: '', content: '', authorName: 'ASARA Lyon', authorEmail: '', isPublished: true });
                  }}
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showArticleForm && (
                <div className="mb-4 p-4 border rounded-lg bg-neutral-50">
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="Titre de l'article"
                    className="input mb-2"
                  />
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    placeholder="Contenu..."
                    rows={8}
                    className="input mb-2"
                  />
                  <input
                    type="text"
                    value={articleForm.authorName}
                    onChange={(e) => setArticleForm({ ...articleForm, authorName: e.target.value })}
                    placeholder="Auteur"
                    className="input mb-2"
                  />
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={articleForm.isPublished}
                      onChange={(e) => setArticleForm({ ...articleForm, isPublished: e.target.checked })}
                    />
                    <span className="text-sm">Publier</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowArticleForm(false)} className="btn-secondary flex-1">
                      Annuler
                    </button>
                    <button onClick={handleSaveArticle} className="btn-primary flex-1">
                      {editingArticle ? 'Modifier' : 'Creer'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {articles.map((article) => (
                  <div key={article.id} className="p-2 bg-neutral-50 rounded flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{article.title}</p>
                      <p className="text-xs text-neutral-500">{article.authorName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${article.isPublished ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>
                        {article.isPublished ? 'Publie' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editArticle(article)} className="p-1 hover:bg-neutral-200 rounded">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteArticle(article.id)} className="p-1 hover:bg-red-100 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apercu PDF */}
            {pdfHtml && (
              <div className="card">
                <h2 className="font-semibold mb-4">Apercu Newsletter</h2>
                <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '500px' }}>
                  <iframe
                    ref={previewRef}
                    srcDoc={pdfHtml}
                    className="w-full h-full"
                    title="Newsletter Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
