import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured.' }), { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  const { rawText, tierLevel = 'Tier 2' } = body;

  const prompt = `You are a senior product marketing manager at Genea Security (physical access control and video management). Extract and generate structured release information from the raw input below.

RAW INPUT:
"""
${rawText}
"""

Return ONLY valid JSON — no markdown, no explanation. Be concise in every field.

{
  "productName": "Product or feature name, extracted exactly as stated",
  "releaseDate": "Release date if mentioned, else empty string. Format: YYYY-MM-DD or e.g. 2026-Q3",
  "productSuite": "Genea product suite (e.g. Genea Access Control, Genea Video Management). Infer if not stated.",
  "relatedReleases": "Comma-separated related products or prior versions mentioned",
  "productInformation": "2-3 paragraph polished summary written for a sales audience. Highlight what is new, what problem it solves, why it matters. Do NOT copy-paste — rewrite professionally.",
  "roadmapItems": [
    { "id": 1, "title": "Prior feature that laid the foundation", "description": "One sentence", "status": "foundation", "releaseDate": "", "featureNoteUrl": "", "isReleased": true },
    { "id": 2, "title": "This release name", "description": "One sentence", "status": "current", "releaseDate": "", "featureNoteUrl": "", "isReleased": false },
    { "id": 3, "title": "Logical next capability", "description": "One sentence", "status": "future", "releaseDate": "", "featureNoteUrl": "", "isReleased": false }
  ],
  "endUserWhat": "1-2 sentences: what this feature is from the end user perspective",
  "endUserWho": "1-2 sentences: who the primary end user is",
  "endUserWhy": "1-2 sentences: why this matters to end users",
  "partnerWhat": "1-2 sentences: what this means for integrators and channel partners",
  "partnerWho": "1-2 sentences: which types of partners this is relevant to",
  "partnerWhy": "1-2 sentences: the business case for partners",
  "additionalResources": "Any URLs or resources mentioned, one per line",
  "missingFields": ["list any field names that could not be determined"]
}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const result = JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, ''));
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Processing failed.' }), { status: 500 });
  }
}
