import { NextRequest, NextResponse } from 'next/server';
import { getAllTransactions } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const transactions = await getAllTransactions();
    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    console.error('Error fetching transactions for admin:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
