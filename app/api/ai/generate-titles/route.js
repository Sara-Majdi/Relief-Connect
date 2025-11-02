import { NextResponse } from 'next/server';
import { generateCampaignTitles } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { disaster, location, state, urgency } = body;

    // Validate required fields
    if (!disaster && !location && !state) {
      return NextResponse.json(
        { error: 'Please provide at least disaster type, location, or state' },
        { status: 400 }
      );
    }

    // Generate titles using OpenAI
    const titles = await generateCampaignTitles({
      disaster,
      location,
      state,
      urgency,
    });

    return NextResponse.json({
      success: true,
      titles,
    });
  } catch (error) {
    console.error('Error generating titles:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      {
        error: 'Failed to generate titles. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
