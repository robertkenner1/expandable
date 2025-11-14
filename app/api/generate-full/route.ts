import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate all 10 levels at once
    const prompts = [
      'Write a single headline (10-15 words) for an article about: ',
      'Write a very brief 1-sentence summary (20-25 words) about: ',
      'Write a short 2-sentence summary (40-50 words) about: ',
      'Write a brief paragraph (80-100 words) about: ',
      'Write a short article (150-180 words) with 2 paragraphs about: ',
      'Write a medium article (250-300 words) with 3 paragraphs about: ',
      'Write a detailed article (400-450 words) with 4 paragraphs about: ',
      'Write a comprehensive article (550-600 words) with 5 paragraphs about: ',
      'Write an in-depth article (700-750 words) with 6 paragraphs about: ',
      'Write a complete, detailed article (900-1000 words) with 7-8 paragraphs about: ',
    ];

    const completions = await Promise.all(
      prompts.map(async (promptPrefix, index) => {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a professional writer. Write clear, engaging content that matches the requested length exactly. For levels 4 and above, structure your content with proper paragraphs separated by line breaks. Do not add titles or section headers, just write flowing paragraphs. Each paragraph should be substantive and well-developed.',
            },
            {
              role: 'user',
              content: promptPrefix + topic,
            },
          ],
          temperature: 0.7,
        });
        return {
          level: index,
          content: completion.choices[0].message.content,
        };
      })
    );

    return NextResponse.json({ levels: completions });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

