import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress query parameter is required' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { walletAddress },
    });

    if (!company) {
      return NextResponse.json([]);
    }

    const contacts = await prisma.contact.findMany({
      where: { companyId: company.id },
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

    if (!name || !walletAddress || !purpose || !adminWalletAddress) {
      return NextResponse.json({ error: 'Missing required fields: name, walletAddress, purpose, adminWalletAddress' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { walletAddress: adminWalletAddress },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not registered for this wallet address' }, { status: 404 });
    }

    const contact = await prisma.contact.upsert({
      where: { walletAddress },
      update: {
        name,
        purpose,
        amount: amount ? Number(amount) : 0.0,
        companyId: company.id,
      },
      create: {
        name,
        walletAddress,
        purpose,
        amount: amount ? Number(amount) : 0.0,
        companyId: company.id,
      },
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    console.error('Failed to create/update contact:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
