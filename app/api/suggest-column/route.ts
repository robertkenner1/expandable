import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { universities, existingColumns } = await req.json()

  const prompt = `Analyze these university options and their pros/cons:

${universities.map((u: any) => `${u.name}:\nPros: ${u.pros}\nCons: ${u.cons}`).join('\n\n')}

Existing evaluation criteria: ${existingColumns.join(', ') || 'none yet'}

Suggest ONE new objective criterion to help evaluate these universities. Choose something that:
1. Is mentioned or implied in the user's notes
2. Can be scored objectively (1-10)
3. Helps differentiate between options
4. Hasn't been covered yet

Return JSON with:
- name: short criterion name (e.g., "Cost", "Location", "Program Strength")
- description: one sentence explaining what this measures
- scores: object with university IDs as keys and scores 1-10 as values

Example format:
{
  "column": {
    "name": "Cost",
    "description": "Overall affordability including tuition and living expenses"
  },
  "scores": {
    "1": 4,
    "2": 3,
    "3": 7,
    "4": 5,
    "5": 9
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
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in suggest-column:', error)
    return NextResponse.json(
      { error: 'Failed to generate column suggestion' },
      { status: 500 }
    )
  }
}

