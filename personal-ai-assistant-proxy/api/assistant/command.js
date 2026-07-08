const SYSTEM_PROMPT = `You are a Play-Store-safe personal AI command parser. Return ONLY valid JSON. Never perform actions. Only classify the user's command. Allowed actions: chat, draft_message, dial_call, create_reminder, create_task, summarize, unknown. For messages and calls, create a draft or dial intent only; user must confirm in the Android app. Schema: {"action":"chat|draft_message|dial_call|create_reminder|create_task|summarize|unknown","targetName":"","targetValue":"","message":"","title":"","datetime":"","notes":"","requiresUserConfirmation":true}`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Assistant-Secret');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'missing_anthropic_api_key' });

  const sharedSecret = process.env.ASSISTANT_SHARED_SECRET;
  if (sharedSecret && req.headers['x-assistant-secret'] !== sharedSecret) return res.status(401).json({ error: 'unauthorized' });

  const { userMessage, contactNames = [] } = req.body || {};
  if (!userMessage || typeof userMessage !== 'string') return res.status(400).json({ error: 'userMessage is required' });

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
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'assistant_upstream_failed', details: data });
    const rawJson = data?.content?.find((b) => b.type === 'text')?.text || '{}';
    res.status(200).json({ rawJson });
  } catch (error) {
    res.status(502).json({ error: 'assistant_proxy_failed' });
  }
};
