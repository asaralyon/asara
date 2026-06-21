// src/app/[locale]/admin/newsletter/stats/page.tsx
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getJwtSecret } from "@/lib/jwt";
import { ArrowLeft, Mail, MousePointer, TrendingUp, Users, Eye, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Stats Newsletter - Admin" };

async function verifyAdmin(locale: string) {
  const token = cookies().get("token")?.value;
  if (!token) redirect(`/${locale}/connexion`);
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (user?.role !== "ADMIN") redirect(`/${locale}/connexion`);
  } catch {
    redirect(`/${locale}/connexion`);
  }
}

async function getNewsletterStats() {
  // Toutes les newsletters avec leurs stats
  const newsletters = await prisma.newsletter.findMany({
    where: { sentAt: { not: null } },
    include: {
      opens: true,
      clicks: true,
    },
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  // Stats globales
  const totalSent = newsletters.reduce((sum, n) => sum + n.recipientCount, 0);
  const totalOpens = newsletters.reduce((sum, n) => sum + n.opens.length, 0);
  const totalClicks = newsletters.reduce((sum, n) => sum + n.clicks.length, 0);

  // Taux moyen d'ouverture
  const avgOpenRate = newsletters.length > 0
    ? newsletters.reduce((sum, n) => {
        const rate = n.recipientCount > 0 ? (n.opens.length / n.recipientCount) * 100 : 0;
        return sum + rate;
      }, 0) / newsletters.length
    : 0;

  return { newsletters, totalSent, totalOpens, totalClicks, avgOpenRate };
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatHour(date: Date) {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function openRate(opens: number, total: number) {
  if (total === 0) return 0;
  return Math.round((opens / total) * 100);
}

function clickRate(clicks: number, total: number) {
  if (total === 0) return 0;
  return Math.round((clicks / total) * 100);
}

function RateBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-neutral-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right">{value}%</span>
    </div>
  );
}

export default async function NewsletterStatsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  await verifyAdmin(locale);

  const { newsletters, totalSent, totalOpens, totalClicks, avgOpenRate } = await getNewsletterStats();

  // Newsletter sélectionnée = la plus récente
  const latest = newsletters[0];

  // Top clics toutes newsletters confondues
  const allClicks = await prisma.newsletterClick.groupBy({
    by: ["label", "url"],
    _count: { _all: true },
    orderBy: { _count: { label: "desc" } },
    take: 10,
  });

  // Openers uniques sur la dernière newsletter
  const latestOpeners = latest
    ? await prisma.newsletterOpen.findMany({
        where: { newsletterId: latest.id },
        orderBy: { openedAt: "asc" },
        take: 50,
      })
    : [];

  const uniqueOpeners = latest
    ? [...new Map(latestOpeners.map((o) => [o.email, o])).values()]
    : [];

  return (
    <section className="section bg-neutral-50 min-h-screen">
      <div className="container-app">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${locale}/admin/newsletter`}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Newsletter
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Statistiques Newsletter</h1>
            <p className="text-neutral-500 text-sm">{newsletters.length} envoi(s) analysés</p>
          </div>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Emails envoyés</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOpens.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Ouvertures totales</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Clics totaux</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(avgOpenRate)}%</p>
                <p className="text-xs text-neutral-500">Taux ouverture moy.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tableau des newsletters */}
            <div className="card overflow-hidden p-0">
              <div className="p-4 border-b border-neutral-100">
                <h2 className="font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Historique des envois
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Envoyés</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Ouvertures</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Clics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {newsletters.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                          Aucune newsletter envoyée pour le moment
                        </td>
                      </tr>
                    )}
                    {newsletters.map((nl) => {
                      const or = openRate(nl.opens.length, nl.recipientCount);
                      const cr = clickRate(nl.clicks.length, nl.recipientCount);
                      const isTest = nl.subject.startsWith("[TEST]");
                      return (
                        <tr key={nl.id} className={`hover:bg-neutral-50 ${isTest ? "opacity-50" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-neutral-800">{formatDate(nl.sentAt)}</p>
                            {isTest && (
                              <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">TEST</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{nl.recipientCount}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="font-medium">{nl.opens.length} <span className="text-neutral-400 font-normal">ouv.</span></p>
                              <RateBar value={or} color={or >= 30 ? "bg-green-500" : or >= 15 ? "bg-amber-500" : "bg-red-400"} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="font-medium">{nl.clicks.length} <span className="text-neutral-400 font-normal">clics</span></p>
                              <RateBar value={cr} color={cr >= 5 ? "bg-purple-500" : cr >= 2 ? "bg-amber-500" : "bg-red-400"} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top clics */}
            <div className="card overflow-hidden p-0">
              <div className="p-4 border-b border-neutral-100">
                <h2 className="font-semibold flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-purple-500" />
                  Top liens cliqués (toutes newsletters)
                </h2>
              </div>
              {allClicks.length === 0 ? (
                <p className="p-6 text-center text-neutral-400 text-sm">Aucun clic enregistré</p>
              ) : (
                <div className="divide-y divide-neutral-50">
                  {allClicks.map((click, i) => {
                    const label = click.label || "Sans label";
                    const isCTA = label.startsWith("CTA_");
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50">
                        <span className="text-neutral-300 font-mono text-xs w-5">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isCTA
                                ? "bg-green-100 text-green-700"
                                : "bg-neutral-100 text-neutral-600"
                            }`}>
                              {label}
                            </span>
                          </div>
                          <a
                            href={click.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neutral-400 hover:text-primary-500 truncate block mt-0.5"
                          >
                            {click.url.length > 60 ? click.url.slice(0, 60) + "…" : click.url}
                          </a>
                        </div>
                        <span className="flex-shrink-0 bg-purple-100 text-purple-700 text-sm font-bold px-2.5 py-1 rounded-full">
                          {click._count._all}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar — Openers dernière newsletter */}
          <div className="space-y-6">

            {/* Résumé dernière newsletter */}
            {latest && (
              <div className="card">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Dernière newsletter
                </h2>
                <p className="text-xs text-neutral-500 mb-4">{formatDate(latest.sentAt)}</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Taux d'ouverture</span>
                      <span className="font-bold text-green-600">{openRate(latest.opens.length, latest.recipientCount)}%</span>
                    </div>
                    <RateBar
                      value={openRate(latest.opens.length, latest.recipientCount)}
                      color="bg-green-500"
                    />
                    <p className="text-xs text-neutral-400 mt-1">{latest.opens.length} ouvertures / {latest.recipientCount} envoyés</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Taux de clic</span>
                      <span className="font-bold text-purple-600">{clickRate(latest.clicks.length, latest.recipientCount)}%</span>
                    </div>
                    <RateBar
                      value={clickRate(latest.clicks.length, latest.recipientCount)}
                      color="bg-purple-500"
                    />
                    <p className="text-xs text-neutral-400 mt-1">{latest.clicks.length} clics / {latest.recipientCount} envoyés</p>
                  </div>

                  {/* CTA breakdown */}
                  {latest.clicks.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-xs font-medium text-neutral-600 mb-2">Répartition des clics</p>
                      {["CTA_INSCRIPTION", "CTA_WHATSAPP"].map((cta) => {
                        const count = latest.clicks.filter((c) => c.label === cta).length;
                        return count > 0 ? (
                          <div key={cta} className="flex justify-between text-xs py-1">
                            <span className="text-neutral-500">{cta.replace("CTA_", "")}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ) : null;
                      })}
                      {latest.clicks
                        .filter((c) => c.label && !c.label.startsWith("CTA_"))
                        .reduce((acc: Record<string, number>, c) => {
                          const l = c.label || "Autre";
                          acc[l] = (acc[l] || 0) + 1;
                          return acc;
                        }, {})
                        && Object.entries(
                          latest.clicks
                            .filter((c) => c.label && !c.label.startsWith("CTA_"))
                            .reduce((acc: Record<string, number>, c) => {
                              const l = c.label || "Autre";
                              acc[l] = (acc[l] || 0) + 1;
                              return acc;
                            }, {})
                        ).slice(0, 3).map(([label, count]) => (
                          <div key={label} className="flex justify-between text-xs py-1">
                            <span className="text-neutral-500 truncate max-w-[140px]">{label}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Liste des openers */}
            <div className="card overflow-hidden p-0">
              <div className="p-4 border-b border-neutral-100">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  Qui a ouvert ? ({uniqueOpeners.length})
                </h2>
              </div>
              {uniqueOpeners.length === 0 ? (
                <p className="p-4 text-center text-neutral-400 text-sm">Aucune ouverture enregistrée</p>
              ) : (
                <div className="divide-y divide-neutral-50 max-h-80 overflow-y-auto">
                  {uniqueOpeners.map((opener) => (
                    <div key={opener.id} className="px-4 py-2.5 hover:bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-800 truncate">{opener.email}</p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(opener.openedAt)} à {formatHour(opener.openedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}