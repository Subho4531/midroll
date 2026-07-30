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
      include: {
        contacts: true,
        teams: {
          include: { members: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ company: null, exists: false });
    }

    return NextResponse.json({ company, exists: true });
  } catch (error: any) {
    console.error('Failed to fetch company details:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { walletAddress, shieldedAddress, name, description } = await req.json();

    if (!walletAddress || !name) {
      return NextResponse.json({ error: 'Missing required fields: walletAddress, name' }, { status: 400 });
    }

    const company = await prisma.company.upsert({
      where: { walletAddress },
      update: {
        name,
        description,
        shieldedAddress: shieldedAddress || null,
      },
      create: {
        walletAddress,
        shieldedAddress: shieldedAddress || null,
        name,
        description: description || null,
      },
      include: {
        contacts: true,
        teams: true,
        transactions: true,
      },
    });

    return NextResponse.json({ company, success: true });
  } catch (error: any) {
    console.error('Failed to create/update company:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
