import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { productName, productSuite, releaseDate, productInformation } = body;

  const prompt = `You are a product marketing expert at Genea Security, a physical access control company. Based on the product release information below, generate concise, sales-ready WHO/WHAT/WHY messaging for two audiences: End Users and Integrators & Partners.

Product Name: ${productName}
Product Suite: ${productSuite}
Release Date: ${releaseDate}
Product Information:
${productInformation}

Return ONLY valid JSON in exactly this structure, no markdown, no explanation:
{
  "endUser": {
    "what": "1-2 sentences: what this feature is from the end user perspective",
    "who": "1-2 sentences: who the primary end user is (role, industry, context)",
    "why": "1-2 sentences: why this matters to them — the pain solved or value gained"
  },
  "partner": {
    "what": "1-2 sentences: what this means for integrators and partners technically/commercially",
    "who": "1-2 sentences: which types of partners and integrators this is relevant to",
    "why": "1-2 sentences: the business case — why partners should care and promote this"
  }
}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = JSON.parse(message.content[0].text.trim());
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Generation failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
