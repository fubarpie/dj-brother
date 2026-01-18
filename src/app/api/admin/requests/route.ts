import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const requests = await prisma.request.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });
    return NextResponse.json(requests);
}
