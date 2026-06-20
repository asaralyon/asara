// src/app/api/newsletter/track/click/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get("n");
  const email = searchParams.get("e");
  const url = searchParams.get("u");
  const label = searchParams.get("l");

  const destination = url ? Buffer.from(url, "base64").toString("utf-8") : "/";

  try {
    if (newsletterId && email && url) {
      const decodedEmail = Buffer.from(email, "base64").toString("utf-8");
      const newsletter = await prisma.newsletter.findUnique({
        where: { id: newsletterId },
      });
      if (newsletter) {
        await prisma.newsletterClick.create({
          data: {
            newsletterId,
            email: decodedEmail,
            url: destination,
            label: label
              ? Buffer.from(label, "base64").toString("utf-8")
              : undefined,
            userAgent: request.headers.get("user-agent") || undefined,
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
              undefined,
          },
        });
      }
    }
  } catch (error) {
    console.error("Newsletter click tracking error:", error);
  }

  return NextResponse.redirect(destination, { status: 302 });
}