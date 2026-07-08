import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a Play-Store-safe personal AI command parser. Return ONLY valid JSON. Never perform actions. Only classify the user's command. Allowed actions: chat, draft_message, dial_call, create_reminder, create_task, summarize, unknown. For messages and calls, create a draft or dial intent only; user must confirm in the Android app. Schema: {"action":"chat|draft_message|dial_call|create_reminder|create_task|summarize|unknown","targetName":"","targetValue":"","message":"","title":"","datetime":"","notes":"","requiresUserConfirmation":true}`;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Assistant-Secret'
    }
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'missing_anthropic_api_key' }, { status: 500, headers: corsHeaders });

  const sharedSecret = process.env.ASSISTANT_SHARED_SECRET;
  if (sharedSecret && req.headers.get('x-assistant-secret') !== sharedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { userMessage, contactNames = [] } = body || {};
  if (!userMessage || typeof userMessage !== 'string') {
    return NextResponse.json({ error: 'userMessage is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `contact_names: ${JSON.stringify(contactNames)}\nuser_message: ${userMessage}` }]
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: 'assistant_upstream_failed', details: data }, { status: upstream.status, headers: corsHeaders });
    }

    const rawJson = data?.content?.find((b: any) => b.type === 'text')?.text || '{}';
    return NextResponse.json({ rawJson }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'assistant_proxy_failed' }, { status: 502, headers: corsHeaders });
  }
}
