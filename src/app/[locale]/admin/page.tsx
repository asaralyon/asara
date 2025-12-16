export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Users, Building2, UserCheck, Clock, Calendar, Mail } from 'lucide-react';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Tableau de bord administration ASARA.',
};

async function getStats() {
  const [totalUsers, professionals, members, pending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.user.count({ where: { status: 'PENDING' } }),
  ]);

  return { totalUsers, professionals, members, pending };
}

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const stats = await getStats();

  return (
    <section className="section bg-neutral-50 min-h-screen">
      <div className="container-app">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-neutral-600">Tableau de bord ASARA</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-neutral-500">Total utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-secondary-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.professionals}</p>
                <p className="text-sm text-neutral-500">Professionnels</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-neutral-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.members}</p>
                <p className="text-sm text-neutral-500">Membres</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-neutral-500">En attente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href={'/' + locale + '/admin/utilisateurs'} className="card hover:shadow-strong transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-lg">Gérer les utilisateurs</h3>
            </div>
            <p className="text-neutral-500 text-sm">Voir, valider ou supprimer des comptes</p>
          </Link>

          <Link href={'/' + locale + '/admin/professionnels'} className="card hover:shadow-strong transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-secondary-500" />
              <h3 className="font-semibold text-lg">Professionnels</h3>
            </div>
            <p className="text-neutral-500 text-sm">Gérer les profils de l'annuaire</p>
          </Link>

          <Link href={'/' + locale + '/admin/evenements'} className="card hover:shadow-strong transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-lg">Événements</h3>
            </div>
            <p className="text-neutral-500 text-sm">Ajouter et gérer les événements</p>
          </Link>

          <Link href={'/' + locale + '/admin/emails'} className="card hover:shadow-strong transition-shadow border-2 border-primary-200 bg-primary-50">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-lg text-primary-700">Emails en masse</h3>
            </div>
            <p className="text-primary-600 text-sm">Envoyer des emails aux membres et professionnels</p>
          </Link>

          <Link href={'/' + locale + '/admin/categories'} className="card hover:shadow-strong transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-neutral-500" />
              <h3 className="font-semibold text-lg">Catégories</h3>
            </div>
            <p className="text-neutral-500 text-sm">Ajouter ou modifier les catégories</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
