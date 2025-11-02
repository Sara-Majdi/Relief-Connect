import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello World" in one word',
        },
      ],
      max_tokens: 10,
    });

    return NextResponse.json({
      success: true,
      response: completion.choices[0].message.content,
      model: completion.model,
    });
  } catch (error) {
    console.error('OpenAI Test Error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);

    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      errorCode: error.code,
      errorStatus: error.status,
    }, { status: 500 });
  }
}
