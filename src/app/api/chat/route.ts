// import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export const maxDuration = 300;

console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const { messages } = await req.json();
    console.log('Messages:', messages);
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'No messages array in request body' }), { status: 400 });
    }
    const userPrompt = messages[messages.length - 1]?.content || '';
    console.log('User prompt:', userPrompt);
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: 'You are a helpful assistant. Always prefer to give inline CSS and HTML code.',
      messages,
      onError: (error) => {
        console.error('Streaming error:', error);
      }
    });
    let fullText = '';
    const encoder = new TextEncoder();

    new ReadableStream({
      async start(controller) {
        for await (const chunk of result.textStream as AsyncIterable<string | { text: string }>) {
          const text = typeof chunk === 'string' ? chunk : chunk.text;
          fullText += text;
          controller.enqueue(encoder.encode(text));
        }
        controller.close();

        await prisma.chat.create({
          data: {
            user: { connect: { email: session.user!.email || "" } },
            prompt: userPrompt,
            response: fullText,
          },
        });
      }
    });

    return result.toDataStreamResponse();
    
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500 });
  }
}
