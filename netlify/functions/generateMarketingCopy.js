const TIER_CHANNELS = {
  'Tier 1': ['LinkedIn', 'Instagram', 'YouTube'],
  'Tier 2': ['LinkedIn', 'YouTube'],
  'Tier 3': ['LinkedIn'],
  'Tier 4': [],
};

const TIER_GUIDANCE = {
  'Tier 1': 'This is a platform-wide or critical release. Write bold, exciting, broad-awareness copy. Full campaign energy across all channels.',
  'Tier 2': 'This is a major feature release targeting enterprise customers. Write professional, value-focused, ICP-targeted copy for LinkedIn and YouTube.',
  'Tier 3': 'This is a feature enhancement or hardware-specific update. Write an informational, technical LinkedIn post for the niche audience who uses this integration or hardware path.',
  'Tier 4': '',
};

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

  const channels = TIER_CHANNELS[tierLevel] || TIER_CHANNELS['Tier 2'];

  // Tier 4 needs no copy
  if (channels.length === 0) {
    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const tierGuidance = TIER_GUIDANCE[tierLevel] || TIER_GUIDANCE['Tier 2'];

  // Build the JSON schema only for the relevant channels
  const channelSchemas = {
    LinkedIn: `  "LinkedIn": {
    "headline": "Punchy professional headline, under 15 words",
    "copy": "Complete LinkedIn post, 150-250 words. Lead with value, end with CTA. Professional but engaging. Use plain ASCII only.",
    "cta": "Call-to-action text. Plain text only, no special characters.",
    "visualDirection": "1-2 sentences on ideal visual or creative direction.",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  }`,
    Instagram: `  "Instagram": {
    "headline": "Short punchy hook, under 10 words",
    "copy": "Complete Instagram caption, 80-150 words. Punchy, benefit-led, conversational. End with hashtags. Use plain ASCII only.",
    "cta": "Call-to-action text. Plain text only, no special characters.",
    "visualDirection": "1-2 sentences on format and style.",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  }`,
    YouTube: `  "YouTube": {
    "headline": "Searchable, compelling video title, under 70 chars",
    "copy": "Video description with topics covered, CTA to subscribe, relevant keywords. 100-200 words. Use plain ASCII only.",
    "cta": "Call-to-action text. Plain text only, no special characters.",
    "visualDirection": "1-2 sentences on video format and what to show on screen.",
    "audienceNotes": "1-2 sentences on target audience and positioning."
  }`,
  };

  const schemaBody = channels.map(ch => channelSchemas[ch]).join(',\n');

  const prompt = `You are a product marketing expert at Genea Security. Write social media copy for this product release.

Product: ${productName}
Suite: ${productSuite}
Release Date: ${releaseDate}
Tier: ${tierLevel}
Tier guidance: ${tierGuidance}
Summary: ${productInformation}
End User Value: ${endUserWhy}

IMPORTANT: Use plain ASCII text only. Do not use smart quotes, em-dashes, arrows (->  is OK), bullets, or any Unicode characters outside the basic ASCII range.

Return ONLY valid JSON — no markdown, no code blocks, no explanation. Only include the channels listed below:

{
${schemaBody}
}`;

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
        max_tokens: 1800,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: '{' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: err.error?.message || `Anthropic API error ${response.status}` }), { status: 502 });
    }

    const data = await response.json();
    const text = ('{' + data.content[0].text).trim();
    const result = JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Generation failed.' }), { status: 500 });
  }
}
