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

  const { productName, productSuite, releaseDate, productInformation, endUserWhy, tierLevel } = body;

  const prompt = `You are a product marketing expert at Genea Security. Write social media copy for this product release.

Product: ${productName}
Suite: ${productSuite}
Release Date: ${releaseDate}
Tier: ${tierLevel}
Summary: ${productInformation}
End User Value: ${endUserWhy}

Return ONLY valid JSON, no markdown:

{
  "LinkedIn": {
    "headline": "Punchy professional headline, under 15 words",
    "copy": "Complete LinkedIn post, 150-250 words. Lead with value, end with CTA. Professional but engaging.",
    "cta": "Call-to-action text",
    "visualDirection": "1-2 sentences on ideal visual or creative direction.",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  },
  "Instagram": {
    "headline": "Short punchy hook, under 10 words",
    "copy": "Complete Instagram caption, 80-150 words. Punchy, benefit-led, conversational. End with hashtags.",
    "cta": "Call-to-action text",
    "visualDirection": "1-2 sentences on format and style (Reel, carousel, static).",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  },
  "YouTube": {
    "headline": "Searchable, compelling video title, under 70 chars",
    "copy": "Video description with topics covered, CTA to subscribe, relevant keywords. 100-200 words.",
    "cta": "Call-to-action text",
    "visualDirection": "1-2 sentences on video format and what to show on screen.",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  }
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
    return new Response(JSON.stringify({ error: err.message || 'Generation failed.' }), { status: 500 });
  }
}
