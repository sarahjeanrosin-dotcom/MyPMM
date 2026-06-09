export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured.' }), { status: 500 });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  const { feature, productDescription, competitorNames } = body;

  if (!competitorNames?.length) {
    return new Response(JSON.stringify({ competitors: [] }), { status: 200 });
  }

  const prompt = `You are an access control industry analyst with deep knowledge of enterprise physical security vendors.

Based on your training knowledge, estimate whether each company has a feature similar to: "${feature}"

Product context: ${productDescription || ''}

For each company, assess their known mobile credential and access control capabilities and provide:
- hasFeature: "yes" if they have something meaningfully similar, "no" if they clearly don't, "unknown" if unclear
- confidence: "high" (strong evidence in training data), "medium" (partial evidence), or "low" (speculative)
- reason: one concise sentence (max 15 words) explaining your estimate

IMPORTANT: Be honest about uncertainty. Use "unknown" if you don't have reliable data. Use plain ASCII only.

Companies to research: ${competitorNames.join(', ')}

Return ONLY valid JSON, no markdown:
{"competitors": [{"name": "...", "hasFeature": "yes/no/unknown", "confidence": "high/medium/low", "reason": "..."}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: '{"competitors":' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err.error?.message || `API error ${response.status}` }), { status: 502 });
    }

    const data = await response.json();
    const text = ('{"competitors":' + data.content[0].text).trim();
    const result = JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Research failed.' }), { status: 500 });
  }
}
