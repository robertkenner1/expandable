import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { universities, columns } = await req.json()

  const prompt = `Based on this university comparison, identify which option best matches the user's criteria.

Universities evaluated:
${universities.map((u: any) => `${u.name}:\n  Pros: ${u.pros}\n  Cons: ${u.cons}\n  Total Score: ${u.totalScore}`).join('\n\n')}

Evaluation criteria:
${columns.map((c: any) => `- ${c.name} (weight: ${(c.weight * 100).toFixed(0)}%)`).join('\n')}

Write:
1. A short title (2-4 words) that captures the core decision they're making based on their notes (e.g., "Choosing a University", "Finding the Right School", "Best CS Program")
2. A single, pointed sentence stating which university is the best match and why. Be direct. Simply state: "[University] is your best option because..." Keep it under 15 words. Do NOT use phrases like "Based on your criteria" or "I recommend". Do NOT mention specific scores or numbers.
3. For each evaluation criterion, write a 2-4 word summary that captures the common theme or key insight across all universities (e.g., for "Cost": "All expensive options", for "Distance": "Mostly far from home", for "Program": "Top-tier programs")

Return ONLY valid JSON in this exact format:
{"title": "your title here", "recommendation": "your text here", "summary": {"criterion_name": "summary text", ...}}`

  try {
    console.log('Calling OpenAI with prompt length:', prompt.length)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes decision criteria and identifies the best match. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    console.log('Received content:', content)
    
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const result = JSON.parse(content)
    console.log('Parsed result:', result)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in generate-model-summary:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate model summary' },
      { status: 500 }
    )
  }
}

