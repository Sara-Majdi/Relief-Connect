import { NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import ReceiptDocument from '@/components/ReceiptDocument';

export async function POST(request) {
  try {
    const body = await request.json();
    const { donor, donation, organization } = body || {};

    if (!donation || !donation.date || !donation.amount) {
      return NextResponse.json({ error: 'Invalid payload: donation details required' }, { status: 400 });
    }

    const doc = ReceiptDocument({ donor, donation, organization });
    const buffer = await pdf(doc).toBuffer();

    const fileName = `${donation.receipt || `RC-${donation.id || 'unknown'}`}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=0, must-revalidate'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}


