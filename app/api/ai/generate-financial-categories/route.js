import { NextResponse } from 'next/server';
import { generateFinancialCategories } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { disaster, totalGoal = 0 } = body;

    // Validate required fields
    if (!disaster) {
      return NextResponse.json(
        { error: 'Please provide disaster type' },
        { status: 400 }
      );
    }

    // Generate financial categories using OpenAI
    const categories = await generateFinancialCategories(disaster, totalGoal);

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error generating financial categories:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial categories. Please try again.' },
      { status: 500 }
    );
  }
}
