import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { universities } = await req.json()

    const prompt = `Analyze these university comparisons and extract structured data:

Universities with pros/cons:
${universities.map((u: any) => `${u.name}:
Pros: ${u.pros}
Cons: ${u.cons}`).join('\n\n')}

Your task:
1. Extract all topics/themes mentioned across all universities (e.g., distance/location, weather/climate, cost/affordability, program quality, culture, etc.)
2. Create 4-6 topic columns that cover the most important themes
3. For each topic, determine its priority based on emotional language intensity:
   - HIGH: Strong emotional words (brutal, amazing, terrible, perfect, dream, concerned, worried, love, hate)
   - MEDIUM: Moderate language (good, nice, okay, decent, reasonable)
   - LOW: Neutral/factual language (has, includes, located, offers)
4. For each university and topic combination:
   - Extract specific facts mentioned in pros/cons
   - If a topic is mentioned for some schools but not others, infer reasonable information based on common knowledge
   - Mark each fact as "positive", "negative", or "neutral" based on how it was framed
5. Transform facts into clear, objective, concrete language:
   - Replace vague descriptions with specific, measurable details
   - Remove subjective language ("perfect", "brutal", "amazing", "dream")
   - Use concrete terms: "Warm, mild winters" instead of "Perfect weather"
   - Include specific data when mentioned: "3,000 miles from home" instead of "Really far"
   - Be brief but precise: 3-6 words per fact when possible
   - Make facts grokable and grounded in reality, not emotion

Return JSON in this exact format:
{
  "topics": [
    { "name": "Distance", "id": "topic_0", "priority": "high" },
    { "name": "Weather", "id": "topic_1", "priority": "medium" },
    ...
  ],
  "normalizedData": [
    {
      "id": "1",
      "name": "Stanford",
      "facts": {
        "topic_0": [
          { "text": "3,000 miles from home", "sentiment": "negative" }
        ],
        "topic_1": [
          { "text": "California weather year-round", "sentiment": "positive" }
        ]
      }
    },
    ...
  ]
}

Important:
- Use the exact university IDs provided
- Each fact should be a single, specific statement
- Sentiment should reflect how the original text framed it
- If information is missing for a university on a topic, include an empty array or a neutral "No specific information" fact`

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a data structuring assistant. Extract and normalize information from unstructured text into structured, sentiment-coded facts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      stream: true,
    })

    // Create a ReadableStream to forward the OpenAI stream to the client
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error in clean-up-table API:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to clean up table data' }),
      { status: 500 }
    )
  }
}

