export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const archives = await prisma.newsletter.findMany({
      where: { sentAt: { not: null } },
      orderBy: { sentAt: 'desc' },
      select: {
        id: true,
        subject: true,
        sentAt: true,
        recipientCount: true,
        pdfUrl: true,
        htmlContent: true,
      },
    });
    return NextResponse.json(archives);
  } catch (error: any) {
    console.error('Archives error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error?.message || 'unknown',
      code: error?.code || 'unknown'
    }, { status: 500 });
  }
}
