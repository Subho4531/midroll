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

    const teams = await prisma.team.findMany({
      where: { companyId: company.id },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(teams);
  } catch (error: any) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, members, adminWalletAddress } = await req.json();

    if (!name || !adminWalletAddress) {
      return NextResponse.json({ error: 'Missing required field: name, adminWalletAddress' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { walletAddress: adminWalletAddress },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not registered for this wallet address' }, { status: 404 });
    }

    const memberList = Array.isArray(members) ? members : [];

    const team = await prisma.team.create({
      data: {
        name,
        companyId: company.id,
        members: {
          connectOrCreate: memberList.map((m: any) => ({
            where: { walletAddress: m.walletAddress },
            create: {
              walletAddress: m.walletAddress,
              name: m.name,
              purpose: m.purpose || 'Team Member',
              amount: m.amount ? Number(m.amount) : 0.0,
              companyId: company.id,
            },
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
