import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    let companyId: string | undefined = undefined;
    if (walletAddress) {
      const company = await prisma.company.findUnique({
        where: { walletAddress },
      });
      if (company) {
        companyId = company.id;
      }
    }

    const contacts = await prisma.contact.findMany({
      where: companyId ? { companyId } : undefined,
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
    const { name, walletAddress, purpose, amount, adminWalletAddress } = await req.json();

    if (!name || !walletAddress || !purpose) {
      return NextResponse.json({ error: 'Missing required fields: name, walletAddress, purpose' }, { status: 400 });
    }

    let companyId: string | null = null;
    if (adminWalletAddress) {
      const company = await prisma.company.findUnique({
        where: { walletAddress: adminWalletAddress },
      });
      if (company) {
        companyId = company.id;
      }
    }

    const contact = await prisma.contact.upsert({
      where: { walletAddress },
      update: {
        name,
        purpose,
        amount: amount ? Number(amount) : 0.0,
        companyId: companyId || undefined,
      },
      create: {
        name,
        walletAddress,
        purpose,
        amount: amount ? Number(amount) : 0.0,
        companyId: companyId || undefined,
      },
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    console.error('Failed to create/update contact:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
