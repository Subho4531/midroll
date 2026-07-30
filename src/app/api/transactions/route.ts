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

    const transactions = await prisma.transactionRecord.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Failed to fetch transaction records:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { walletAddress, txHash, type, amount, recipientCount, status, metadata } = await req.json();

    if (!walletAddress || !txHash || !type || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields: walletAddress, txHash, type, amount' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { walletAddress },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not registered for this wallet address' }, { status: 404 });
    }

    const record = await prisma.transactionRecord.create({
      data: {
        companyId: company.id,
        txHash,
        type,
        amount: Number(amount),
        recipientCount: recipientCount ? Number(recipientCount) : 1,
        status: status ? String(status) : 'CONFIRMED',
        metadata: metadata ? String(metadata) : null,
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Failed to create transaction record:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { txHash, status, newTxHash } = await req.json();

    if (!txHash || !status) {
      return NextResponse.json({ error: 'Missing required fields: txHash, status' }, { status: 400 });
    }

    const updated = await prisma.transactionRecord.updateMany({
      where: { txHash },
      data: {
        status,
        txHash: newTxHash ? newTxHash : undefined,
      },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error: any) {
    console.error('Failed to update transaction record:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
