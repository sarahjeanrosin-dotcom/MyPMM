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

  const prompt = `You are a senior product marketing manager at Genea Security, a physical access control and video management company. You have received raw product release information from an internal team. Your job is to read it carefully and produce a complete, polished release object.

RAW INPUT:
"""
${rawText}
"""

TIER LEVEL: ${tierLevel}

Using the raw input above, extract factual details and generate polished marketing content. Return ONLY valid JSON matching this exact structure. No markdown, no explanation, only JSON.

{
  "productName": "The name of the product or feature being released. Extract exactly as stated.",
  "releaseDate": "Release date if mentioned, otherwise empty string. Format: YYYY-MM-DD or descriptive like '2026-Q3'.",
  "productSuite": "Which Genea product suite this belongs to (e.g. 'Genea Access Control', 'Genea Video Management', 'Genea Visitor Management'). Infer if not stated.",
  "relatedReleases": "Comma-separated list of related products or prior versions mentioned in the text.",
  "productInformation": "A clean, polished 2-3 paragraph summary of this release written for a sales audience. Highlight what is new, what problem it solves, and why it matters. Do not copy-paste the raw input — rewrite it professionally.",
  "roadmapItems": [
    {
      "id": 1,
      "title": "Name of a prior feature that laid the foundation for this release",
      "description": "Brief description",
      "status": "foundation",
      "releaseDate": "date if known, otherwise empty",
      "featureNoteUrl": "",
      "isReleased": true
    },
    {
      "id": 2,
      "title": "This current release name",
      "description": "Brief description of this release",
      "status": "current",
      "releaseDate": "release date if known",
      "featureNoteUrl": "",
      "isReleased": false
    },
    {
      "id": 3,
      "title": "A logical next capability that would follow this release",
      "description": "Brief description of what comes next",
      "status": "future",
      "releaseDate": "",
      "featureNoteUrl": "",
      "isReleased": false
    }
  ],
  "endUserWhat": "1-2 polished sentences describing what this feature is from the end user perspective.",
  "endUserWho": "1-2 polished sentences describing the primary end user — their role, industry, and context.",
  "endUserWhy": "1-2 polished sentences explaining why this matters to end users — the pain solved or value gained.",
  "partnerWhat": "1-2 polished sentences describing what this means for integrators and channel partners.",
  "partnerWho": "1-2 polished sentences describing which types of partners this is relevant to.",
  "partnerWhy": "1-2 polished sentences explaining the business case for partners.",
  "additionalResources": "Any URLs, help center links, documentation, or resources mentioned in the raw input, one per line.",
  "marketingCopy": {
    "LinkedIn": {
      "headline": "A punchy, professional headline for LinkedIn (under 15 words)",
      "copy": "A complete LinkedIn post (3-5 short paragraphs). Lead with the value. End with a CTA. Professional but engaging tone. 150-250 words.",
      "cta": "The call-to-action text (e.g. 'Learn more at getgenea.com')",
      "visualDirection": "1-2 sentences describing the ideal visual or creative direction for this post.",
      "audienceNotes": "1-2 sentences on the target audience and positioning for this channel."
    },
    "Instagram": {
      "headline": "A short punchy hook for Instagram (under 10 words, can include emoji)",
      "copy": "A complete Instagram caption (2-3 short paragraphs). Punchy, benefit-led, conversational. End with hashtags. 80-150 words.",
      "cta": "The call-to-action text (e.g. 'Link in bio')",
      "visualDirection": "1-2 sentences describing the ideal visual — format (Reel, carousel, static), style, and content.",
      "audienceNotes": "1-2 sentences on the target audience and positioning for this channel."
    },
    "YouTube": {
      "headline": "A YouTube video title that is searchable and compelling (under 70 chars)",
      "copy": "A complete YouTube video description including: what the video covers, 3-5 bullet points of topics, a CTA to subscribe, and relevant keywords. 100-200 words.",
      "cta": "The call-to-action text (e.g. 'Subscribe for more Genea product updates')",
      "visualDirection": "1-2 sentences on video format, style, and what should be shown on screen.",
      "audienceNotes": "1-2 sentences on the target audience and positioning for this channel."
    }
  },
  "missingFields": ["list of field names that could not be determined from the raw input and need user input"]
}

Important: For roadmapItems, create 3 items — one foundation (a related or prior feature), one current (this release), one future (a logical next step). Base the foundation item on any related releases mentioned in the input. If none are mentioned, infer a reasonable prior capability. The future item should be a logical next evolution.`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = JSON.parse(message.content[0].text.trim());
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Processing failed.' }), { status: 500 });
  }
}
