import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
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
    const { name, members } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const memberList = Array.isArray(members) ? members : [];

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          connectOrCreate: memberList.map((m: any) => ({
            where: { walletAddress: m.walletAddress },
            create: {
              walletAddress: m.walletAddress,
              name: m.name,
              purpose: m.purpose || 'Team Member',
              amount: m.amount ? Number(m.amount) : 0.0,
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
