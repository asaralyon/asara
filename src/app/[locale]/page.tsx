export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Calendar, Building2, Users, Newspaper, FileText } from "lucide-react";
import prisma from "@/lib/prisma";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { NewsSection } from "@/components/home/NewsSection";
import NewsletterSection from "@/components/home/NewsletterSection";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  return {
    title:
      locale === "ar"
        ? "جمعية السوريين في أوفيرن رون ألب | ASARA Lyon"
        : "Association des Syriens d'Auvergne Rhône-Alpes | ASARA Lyon",
    description:
      locale === "ar"
        ? "انضم إلى مجتمع ASARA - جمعية السوريين في أوفيرن رون ألب. اكتشف المحترفين السوريين وابق على اطلاع بأحداث المجتمع."
        : "Rejoignez la communauté ASARA - Association des Syriens d'Auvergne Rhône-Alpes. Découvrez les professionnels syriens et restez informé des événements.",
    alternates: {
      canonical: "https://asara-lyon.fr/" + locale,
    },
  };
}

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations("home");
  const isRTL = locale === "ar";

  // ✅ Dernier article publié (mêmes articles que tu gères dans l’admin newsletter)
  const latestArticle = await prisma.article.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      authorName: true,
      createdAt: true,
    },
  });

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      {/* JSON-LD pour SEO */}
      <OrganizationJsonLd locale={locale} />

      {/* Services (en haut car Hero supprimé) */}
      <section className="py-16 bg-neutral-50">
        <div className="container-app">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            {isRTL ? "خدماتنا" : "Nos services"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              href={"/" + locale + "/annuaire"}
              className="card hover:shadow-strong transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "الدليل المهني" : "Annuaire professionnel"}
              </h3>
              <p className="text-neutral-600">
                {isRTL
                  ? "اكتشف المحترفين السوريين في منطقتك"
                  : "Découvrez les professionnels syriens de votre région"}
              </p>
            </Link>

            <Link
              href={"/" + locale + "/evenements"}
              className="card hover:shadow-strong transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "الفعاليات" : "Événements"}
              </h3>
              <p className="text-neutral-600">
                {isRTL
                  ? "شارك في فعاليات المجتمع"
                  : "Participez aux événements de la communauté"}
              </p>
            </Link>

            <Link
              href={"/" + locale + "/adhesion"}
              className="card hover:shadow-strong transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "العضوية" : "Adhésion"}
              </h3>
              <p className="text-neutral-600">
                {isRTL ? "انضم إلى جمعيتنا" : "Rejoignez notre association"}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Articles de nos membres (avant Actualités de Syrie) */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="flex items-center justify-center gap-3 mb-10">
            <FileText className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              {isRTL ? "مقالات أعضائنا" : "Articles de nos membres"}
            </h2>
          </div>

          {latestArticle ? (
            <div className="max-w-5xl mx-auto card">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-600 mb-2">
                {latestArticle.title}
              </h3>

              <p className="text-sm text-neutral-500 mb-4">
                {isRTL ? "بقلم" : "Par"} {latestArticle.authorName}
                {" • "}
                {new Date(latestArticle.createdAt).toLocaleDateString("fr-FR")}
              </p>

              <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {latestArticle.content || ""}
            </div>
            </div>
          ) : (
            <p className="text-center text-neutral-500">
              {isRTL
                ? "لا توجد مقالات منشورة حالياً"
                : "Aucun article publié pour le moment."}
            </p>
          )}
        </div>
      </section>

      {/* Actualités RSS */}
      <section className="py-16 bg-white">
        <div className="container-app">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Newspaper className="w-8 h-8 text-primary-600" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              {isRTL ? "آخر الأخبار من سوريا" : "Actualités de Syrie"}
            </h2>
          </div>
          <NewsSection />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection locale={locale} />

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="container-app text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link
            href={"/" + locale + "/adhesion"}
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            {isRTL ? "سجل الآن" : "S'inscrire maintenant"}
            {/* ArrowRight supprimée (plus importée) volontairement pour garder une UI simple */}
          </Link>
        </div>
      </section>
    </main>
  );
}
