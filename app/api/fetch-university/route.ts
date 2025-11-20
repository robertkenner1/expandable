import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { universityName, columns } = await req.json()

  const prompt = `The user is evaluating universities and wants to add "${universityName}" to their comparison table.

Existing evaluation criteria:
${columns.map((c: any) => `- ${c.name}: ${c.description || ''}`).join('\n')}

Please provide:
1. Pros for ${universityName} (1-2 sentences highlighting positives)
2. Cons for ${universityName} (1-2 sentences highlighting negatives)
3. Scores (1-10) for each criterion listed above

Return JSON with:
- pros: string (positive aspects)
- cons: string (negative aspects)
- scores: object with column IDs as keys and scores 1-10 as values

Example format:
{
  "pros": "Top-tier computer science program with excellent research opportunities and strong industry connections.",
  "cons": "Very competitive environment and expensive tuition with high cost of living.",
  "scores": {
    "col_cost": 4,
    "col_program": 9,
    "col_location": 7,
    "col_culture": 8
  }
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    const result = JSON.parse(content)
    return NextResponse.json({
      university: result
    })
  } catch (error) {
    console.error('Error in fetch-university:', error)
    return NextResponse.json(
      { error: 'Failed to fetch university data' },
      { status: 500 }
    )
  }
}

