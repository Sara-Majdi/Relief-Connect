import { NextResponse } from 'next/server';
import { generateFundraisingItems } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { disaster, count = 5 } = body;

    // Validate required fields
    if (!disaster) {
      return NextResponse.json(
        { error: 'Please provide disaster type' },
        { status: 400 }
      );
    }

    // Validate count
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Generate fundraising items using OpenAI
    const items = await generateFundraisingItems(disaster, count);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Error generating fundraising items:', error);
    return NextResponse.json(
      { error: 'Failed to generate fundraising items. Please try again.' },
      { status: 500 }
    );
  }
}
