export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { EventAssociationActions } from '@/components/admin/EventAssociationActions';

export const metadata: Metadata = { title: 'Événements associations - Admin' };

async function getPendingEvents() {
  return prisma.event.findMany({
    where: {
      associationId: { not: null },
    },
    include: {
      association: {
        select: {
          associationName: true,
          user: {
            select: { email: true, firstName: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminEventsAssociationsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const events = await getPendingEvents();

  const pending = events.filter((e) => e.status === 'PENDING');
  const others = events.filter((e) => e.status !== 'PENDING');

  return (
    <section className="section bg-neutral-50 min-h-screen">
      <div className="container-app">
        <Link
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Événements des associations
          </h1>
          <p className="text-neutral-600">
            {pending.length} en attente · {others.length} traité(s)
          </p>
        </div>

        {/* En attente */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              En attente de validation ({pending.length})
            </h2>
            <div className="space-y-4">
              {pending.map((event) => (
                <div key={event.id} className="card border-2 border-yellow-200 bg-yellow-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {event.imageUrl1 ? (
                        <img
                          src={event.imageUrl1}
                          alt={event.title}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <p className="text-sm text-primary-600 font-medium">
                          {event.association?.associationName}
                        </p>
                        {event.description && (
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-500">
                          {event.eventDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Soumis le {new Date(event.createdAt).toLocaleDateString('fr-FR')} par{' '}
                          {event.association?.user?.email}
                        </p>
                      </div>
                    </div>
                    <EventAssociationActions event={event} />
                  </div>

                  {/* Prévisualisation images */}
                  {(event.imageUrl2 || event.imageUrl3) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-yellow-200">
                      {event.imageUrl2 && (
                        <img src={event.imageUrl2} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      {event.imageUrl3 && (
                        <img src={event.imageUrl3} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && (
          <div className="card text-center py-12 mb-8">
            <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">Aucun événement en attente de validation</p>
          </div>
        )}

        {/* Traités */}
        {others.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-neutral-600">
              Événements traités ({others.length})
            </h2>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">Événement</th>
                    <th className="text-left p-4 font-semibold text-sm">Association</th>
                    <th className="text-left p-4 font-semibold text-sm">Date</th>
                    <th className="text-left p-4 font-semibold text-sm">Statut</th>
                    <th className="text-right p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {others.map((event) => (
                    <tr key={event.id} className="hover:bg-neutral-50">
                      <td className="p-4">
                        <p className="font-medium">{event.title}</p>
                        {event.location && (
                          <p className="text-sm text-neutral-500">{event.location}</p>
                        )}
                      </td>
                      <td className="p-4 text-sm text-neutral-600">
                        {event.association?.associationName}
                      </td>
                      <td className="p-4 text-sm text-neutral-500">
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="p-4">
                        {event.status === 'APPROVED' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Approuvé
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Refusé
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <EventAssociationActions event={event} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}