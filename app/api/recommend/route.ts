import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { universities, columns } = await req.json()

  const prompt = `Based on this analysis of universities:

${universities.map((u: any) => 
  `${u.name}:\n  Pros: ${u.pros}\n  Cons: ${u.cons}\n  Total Score: ${u.totalScore}`
).join('\n\n')}

Evaluation criteria used:
${columns.map((c: any) => `- ${c.name} (weight: ${(c.weight * 100).toFixed(0)}%): ${c.description || ''}`).join('\n')}

Provide a thoughtful recommendation for which university to attend. Consider:
1. The quantitative scores
2. The qualitative factors in their notes
3. What seems most important to this student

Be direct and specific. Start with your recommendation, then explain why in 2-3 sentences.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    return NextResponse.json({
      recommendation: content
    })
  } catch (error) {
    console.error('Error in recommend:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    )
  }
}

