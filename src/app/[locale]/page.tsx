export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { GlobalMarketsBanner } from "@/components/home/GlobalMarketsBanner";
import { ArticleUne } from "@/components/home/ArticleUne";
import { EconomySection } from "@/components/home/EconomySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { IslamicFinanceSection } from "@/components/home/IslamicFinanceSection";
import { StartupsSection } from "@/components/home/StartupsSection";
import { SyriaPoliticsSection } from "@/components/home/SyriaPoliticsSection";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  return {
    title:
      locale === "ar"
        ? "دليل السوريين في فرنسا | ASARA"
        : "Annuaire des Syriens de France | ASARA",
    description:
      locale === "ar"
        ? "انضم إلى مجتمع ASARA - دليل السوريين في فرنسا. اكتشف المحترفين السوريين وابق على اطلاع بأحداث المجتمع."
        : "Rejoignez la communauté ASARA - Annuaire des Syriens de France. Découvrez les professionnels syriens et restez informé des événements.",
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
      <OrganizationJsonLd locale={locale} />

      <h1 className="sr-only">
        {isRTL ? "دليل السوريين في فرنسا" : "Annuaire des Syriens de France"}
      </h1>

      <GlobalMarketsBanner locale={locale} />

      {latestArticle && <ArticleUne article={latestArticle} locale={locale} isRTL={isRTL} />}
      <SyriaPoliticsSection locale={locale} />
      <EconomySection locale={locale} />
      <IslamicFinanceSection locale={locale} /> 
      <StartupsSection locale={locale} />
      <section className="py-10 bg-white border-t border-neutral-200">
        <div className="container-app">
          <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="w-1 h-6 bg-primary-500 inline-block" />
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {isRTL ? "أخبار سوريا" : "Actualités de Syrie"}
            </h2>
          </div>
         
        </div>
      </section>

      <NewsletterSection locale={locale} />

      <section className="py-10 bg-primary-600">
        <div className="container-app text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {t("cta.title")}
          </h2>
          <p className="text-primary-100 mb-6 max-w-xl mx-auto text-sm">
            {t("cta.subtitle")}
          </p>
          <Link
            href={"/" + locale + "/adhesion"}
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-sm"
          >
            {isRTL ? "سجل الآن" : "S'inscrire maintenant"}
          </Link>
        </div>
      </section>
    </main>
  );
}
