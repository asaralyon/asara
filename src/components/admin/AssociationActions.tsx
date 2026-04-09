'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';

interface AssociationActionsProps {
  association: { id: string; slug: string; isPublished: boolean };
  locale: string;
}

export function AssociationActions({ association, locale }: AssociationActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/associations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ associationId: association.id, isPublished: !association.isPublished }),
      });
      router.refresh();
    } catch (e) { 
      console.error('Erreur lors de la publication:', e); 
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette association ?')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/associations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ associationId: association.id }),
      });
      router.refresh();
    } catch (e) { 
      console.error('Erreur lors de la suppression:', e); 
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <span className="text-sm text-neutral-400">...</span>;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className="p-2 hover:bg-neutral-100 rounded-lg"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {open && (
        <>
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 min-w-[180px] z-30">
            
            {/* ✅ CORRECTION : Balise <a> ajoutée + rel pour sécurité */}
            <a
              href={`/${locale}/annuaire-associations/${association.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 text-left"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" /> Voir la fiche
            </a>
            
            <button 
              onClick={togglePublish} 
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 text-left"
            >
              {association.isPublished ? (
                <><EyeOff className="w-4 h-4 text-yellow-500" /> Masquer</>
              ) : (
                <><Eye className="w-4 h-4 text-green-500" /> Publier</>
              )}
            </button>
            
            <button 
              onClick={handleDelete} 
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
          
          {/* Overlay pour fermer au clic extérieur */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}

export default AssociationActions;