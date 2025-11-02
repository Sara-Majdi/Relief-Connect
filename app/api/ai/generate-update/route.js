import { NextResponse } from 'next/server';
import { generateCampaignUpdate } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      campaignTitle,
      updateType = 'progress',
      progressPercentage,
      amountRaised,
      totalGoal,
      recentDonations,
    } = body;

    // Validate required fields
    if (!campaignTitle) {
      return NextResponse.json(
        { error: 'Please provide campaign title' },
        { status: 400 }
      );
    }

    // Validate update type
    const validTypes = ['progress', 'milestone', 'thankyou', 'impact'];
    if (!validTypes.includes(updateType)) {
      return NextResponse.json(
        { error: 'Invalid update type. Must be: progress, milestone, thankyou, or impact' },
        { status: 400 }
      );
    }

    // Generate campaign update using OpenAI
    const update = await generateCampaignUpdate({
      campaignTitle,
      updateType,
      progressPercentage,
      amountRaised,
      totalGoal,
      recentDonations,
    });

    return NextResponse.json({
      success: true,
      update,
    });
  } catch (error) {
    console.error('Error generating campaign update:', error);
    return NextResponse.json(
      { error: 'Failed to generate campaign update. Please try again.' },
      { status: 500 }
    );
  }
}
