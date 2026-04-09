export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Building } from 'lucide-react';
import { AssociationActions } from '@/components/admin/AssociationActions';

export const metadata: Metadata = { title: 'Associations - Admin' };

async function getAssociations() {
  return prisma.associationProfile.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminAssociationsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const associations = await getAssociations();

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
            <Building className="w-6 h-6 text-green-600" /> Associations
          </h1>
          <p className="text-neutral-600">{associations.length} association(s)</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Association</th>
                  <th className="text-left p-4 font-semibold text-sm">Responsable</th>
                  <th className="text-left p-4 font-semibold text-sm">Ville</th>
                  <th className="text-left p-4 font-semibold text-sm">N° Enregistrement</th>
                  <th className="text-left p-4 font-semibold text-sm">Publiée</th>
                  <th className="text-right p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {associations.map((assoc) => (
                  <tr key={assoc.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      <p className="font-medium">{assoc.associationName}</p>
                      <p className="text-sm text-neutral-500">{assoc.user.email}</p>
                    </td>
                    <td className="p-4 text-sm">
                      {assoc.user.firstName} {assoc.user.lastName}
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{assoc.city || '—'}</td>
                    <td className="p-4 text-sm font-mono text-neutral-500">
                      {assoc.registrationNumber || '—'}
                    </td>
                    <td className="p-4">
                      {assoc.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <Eye className="w-4 h-4" /> Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
                          <EyeOff className="w-4 h-4" /> Non
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <AssociationActions association={assoc} locale={locale} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {associations.length === 0 && (
              <p className="text-center py-8 text-neutral-500">Aucune association</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}