import { NextResponse } from 'next/server';
import { polishCopy } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, tone = 'professional', context = 'campaign description' } = body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide text to polish' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 2000 characters.' },
        { status: 400 }
      );
    }

    // Polish the copy using Gemini
    const polishedText = await polishCopy(text, { tone, context });

    return NextResponse.json({
      success: true,
      original: text,
      polished: polishedText,
      tone,
    });
  } catch (error) {
    console.error('Error polishing copy:', error);
    return NextResponse.json(
      { error: 'Failed to polish copy. Please try again.' },
      { status: 500 }
    );
  }
}
