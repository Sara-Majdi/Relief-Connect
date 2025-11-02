import { NextResponse } from 'next/server';
import { generateCampaignDescription } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      disaster,
      location,
      state,
      urgency,
      beneficiaries,
      goal,
      title,
      type = 'short', // 'short' or 'long'
    } = body;

    // Validate required fields
    if (!disaster && !title) {
      return NextResponse.json(
        { error: 'Please provide at least disaster type or campaign title' },
        { status: 400 }
      );
    }

    // Generate description using Gemini
    const description = await generateCampaignDescription(
      {
        disaster,
        location,
        state,
        urgency,
        beneficiaries,
        goal,
        title,
      },
      type
    );

    return NextResponse.json({
      success: true,
      description,
      type,
    });
  } catch (error) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description. Please try again.' },
      { status: 500 }
    );
  }
}
