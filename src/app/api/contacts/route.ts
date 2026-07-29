import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        teams: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, walletAddress, purpose, amount } = await req.json();

    if (!name || !walletAddress || !purpose) {
      return NextResponse.json({ error: 'Missing required fields: name, walletAddress, purpose' }, { status: 400 });
    }

    const contact = await prisma.contact.upsert({
      where: { walletAddress },
      update: { name, purpose, amount: amount ? Number(amount) : 0.0 },
      create: { name, walletAddress, purpose, amount: amount ? Number(amount) : 0.0 },
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    console.error('Failed to create/update contact:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
