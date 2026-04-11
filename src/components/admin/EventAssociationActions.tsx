'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface EventAssociationActionsProps {
  event: { id: string; status: string };
}

export function EventAssociationActions({ event }: EventAssociationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Approuver et publier cet événement ?'
        : 'Refuser cet événement ?'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await fetch('/api/admin/events-associations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, action }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />;
  }

  if (event.status === 'PENDING') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction('approve')}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          Approuver
        </button>
        <button
          onClick={() => handleAction('reject')}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          <XCircle className="w-4 h-4" />
          Refuser
        </button>
      </div>
    );
  }

  if (event.status === 'APPROVED') {
    return (
      <button
        onClick={() => handleAction('reject')}
        className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
      >
        <XCircle className="w-4 h-4" />
        Révoquer
      </button>
    );
  }

  if (event.status === 'REJECTED') {
    return (
      <button
        onClick={() => handleAction('approve')}
        className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors text-sm"
      >
        <CheckCircle className="w-4 h-4" />
        Approuver
      </button>
    );
  }

  return null;
}

export default EventAssociationActions;