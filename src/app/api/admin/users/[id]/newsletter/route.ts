export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });
    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { newsletterOptIn } = body;

  if (typeof newsletterOptIn !== "boolean") {
    return NextResponse.json(
      { error: "newsletterOptIn doit être un boolean" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { newsletterOptIn },
    select: { id: true, email: true, newsletterOptIn: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
