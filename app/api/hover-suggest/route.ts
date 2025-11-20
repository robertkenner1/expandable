import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

type HoverContext = {
  type: 'text' | 'heading' | 'link' | 'code' | 'list' | 'image' | 'quote'
  content: string
  element: string
  surroundingText?: string
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
          content: `You are a helpful AI assistant that provides concise, contextual suggestions. Keep responses under 3 sentences. Be direct and actionable. Focus on insights, explanations, or suggestions that would be valuable at this exact moment.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
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
    console.error('Error in hover-suggest:', error)
    return new Response('Error generating suggestion', { status: 500 })
  }
}

function generatePrompt(context: HoverContext): string {
  const { type, content, surroundingText } = context
  
  switch (type) {
    case 'heading':
      return `The user is hovering over a heading: "${content}". Based on the surrounding context: "${surroundingText?.substring(0, 300)}", provide a brief insight about what this section covers or why it matters.`
    
    case 'link':
      return `The user is hovering over a link with text: "${content}". Suggest what clicking this might reveal or why it's relevant to the current topic.`
    
    case 'code':
      return `The user is hovering over code: "${content}". Explain what this code does or suggest how it might be used.`
    
    case 'list':
      return `The user is hovering over a list item: "${content}". In the context of: "${surroundingText?.substring(0, 300)}", provide a quick insight or expansion on this point.`
    
    case 'quote':
      return `The user is hovering over a quote: "${content}". Provide context or interpretation of this quote.`
    
    case 'text':
    default:
      return `The user is hovering over this text: "${content}". Context: "${surroundingText?.substring(0, 300)}". Provide a relevant insight, clarification, or related idea that would be valuable right now.`
  }
}

