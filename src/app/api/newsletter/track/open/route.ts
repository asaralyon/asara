// src/app/api/newsletter/track/open/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GIF transparent 1x1 pixel
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get("n");
  const email = searchParams.get("e");

  try {
    if (newsletterId && email) {
      const decodedEmail = Buffer.from(email, "base64").toString("utf-8");
      const newsletter = await prisma.newsletter.findUnique({
        where: { id: newsletterId },
      });
      if (newsletter) {
        await prisma.newsletterOpen.create({
          data: {
            newsletterId,
            email: decodedEmail,
            userAgent: request.headers.get("user-agent") || undefined,
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
              undefined,
          },
        });
      }
    }
  } catch (error) {
    // Silencieux — on retourne le pixel quand même
    console.error("Newsletter open tracking error:", error);
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}