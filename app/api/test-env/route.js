import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7);

  return NextResponse.json({
    hasOpenAIKey: hasKey,
    keyPrefix: keyPrefix,
    nodeEnv: process.env.NODE_ENV,
  });
}
