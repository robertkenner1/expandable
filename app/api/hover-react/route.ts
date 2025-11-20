import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

type HoverContext = {
  type: 'paragraph' | 'sentence' | 'image' | 'button' | 'background'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const context: HoverContext = await req.json()
    
    // Generate prompt based on context type
    const prompt = generatePrompt(context)
    
    // Stream the response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an observant AI that reacts to what the user's cursor hovers over. Be brief (1-2 sentences max), insightful, and conversational. React naturally as if you're noticing things alongside the user. No formal language—speak like a thoughtful companion.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 80,
      stream: true
    })

    // Create a readable stream
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
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
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch (error) {
    console.error('Error in hover-react:', error)
    return new Response('Error generating reaction', { status: 500 })
  }
}

function generatePrompt(context: HoverContext): string {
  const { type, content } = context
  
  switch (type) {
    case 'paragraph':
      return `User is hovering over this paragraph: "${content}". React to the overall idea.`
    
    case 'sentence':
      return `User is hovering over this specific sentence: "${content}". What's interesting about this particular thought?`
    
    case 'image':
      return `User is hovering over an image: "${content}". React to what this image might represent or evoke.`
    
    case 'button':
      return `User is interacting with: "${content}". Provide a thoughtful observation about AI interfaces.`
    
    case 'background':
      return `User's cursor is floating in empty space. Make a brief meta-observation about interfaces, attention, or exploration.`
    
    default:
      return `User is hovering over: "${content}". React naturally.`
  }
}

