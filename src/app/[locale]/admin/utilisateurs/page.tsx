export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { UserActions } from '@/components/admin/UserActions';
import { NewsletterOptInToggle } from '@/components/admin/NewsletterOptInToggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Utilisateurs - Admin',
};

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <section className="section bg-neutral-50 min-h-screen">
      <div className="container-app">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-neutral-600">{users.length} utilisateur(s)</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">Nom</th>
                  <th className="text-left p-4 font-semibold text-sm">Email</th>
                  <th className="text-left p-4 font-semibold text-sm">Role</th>
                  <th className="text-left p-4 font-semibold text-sm">Statut</th>
                  <th className="text-left p-4 font-semibold text-sm">Newsletter</th>
                  <th className="text-left p-4 font-semibold text-sm">Date</th>
                  <th className="text-right p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-neutral-600">{user.email}</td>

                    <td className="p-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-600'
                            : user.role === 'PROFESSIONAL'
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-600'
                            : user.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <NewsletterOptInToggle
                        userId={user.id}
                        initialValue={user.newsletterOptIn}
                      />
                    </td>

                    <td className="p-4 text-sm text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="p-4 text-right">
                      <UserActions user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="text-center py-8 text-neutral-500">Aucun utilisateur</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
