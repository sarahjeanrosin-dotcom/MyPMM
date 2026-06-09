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

  const { productName, productSuite, releaseDate, productInformation, endUserWhy,
          tierLevel, selectedChannels, competitors, competitivePosition,
          playbookBrief, targetVerticals } = body;

  // Use explicit channel selection if provided, otherwise fall back to tier defaults
  const channels = (selectedChannels?.length ? selectedChannels : null)
    || TIER_CHANNELS[tierLevel]
    || TIER_CHANNELS['Tier 2'];

  // Tier 4 needs no copy
  if (channels.length === 0) {
    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const tierGuidance = TIER_GUIDANCE[tierLevel] || TIER_GUIDANCE['Tier 2'];

  const verticals = (targetVerticals || []);

  // Vertical angles for social channels — 1 sentence each
  const verticalAnglesSnippet = verticals.length
    ? `,\n    "verticalAngles": [${verticals.map(v => `{"vertical": "${v}", "angle": "WRITE a 1-sentence angle for the ${v} audience. Plain ASCII."}`).join(', ')}]`
    : '';

  // Helper: vertical emails block — explicit write instructions, literal CTAs
  const makeVerticalEmailsSnippet = (audienceLabel, ctaBase) => !verticals.length ? '' :
    `,\n      "verticalEmails": [${verticals.map(v => {
      const kbaKey = v.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      return `{"vertical": "${v}", "subject": "WRITE a subject line for ${audienceLabel} in the ${v} sector, under 10 words", "body": "WRITE 100-150 words for ${audienceLabel} in the ${v} sector, highlighting ${v}-specific pain points this feature solves. Plain ASCII only.", "cta2": "[${ctaBase} - ${kbaKey} KBA LINK]"}`;
    }).join(', ')}]`;

  // Build the JSON schema only for the relevant channels
  const socialSchema = (name, copySpec) => `  "${name}": {
    "headline": WRITE ${copySpec.headline},
    "copy": WRITE ${copySpec.copy},
    "cta": WRITE a call-to-action phrase. Plain ASCII only.,
    "visualDirection": WRITE 1-2 sentences on ideal visual direction.,
    "audienceNotes": WRITE 1-2 sentences on target audience and positioning.${verticalAnglesSnippet}
  }`;

  const channelSchemas = {
    LinkedIn:  socialSchema('LinkedIn',  { headline: 'a punchy professional headline, under 15 words', copy: 'a complete LinkedIn post, 150-250 words. Lead with value, end with CTA. Plain ASCII.' }),
    Instagram: socialSchema('Instagram', { headline: 'a short punchy hook, under 10 words', copy: 'a complete Instagram caption, 80-150 words. Punchy, benefit-led. End with hashtags. Plain ASCII.' }),
    YouTube:   socialSchema('YouTube',   { headline: 'a searchable video title, under 70 chars', copy: 'a video description with topics covered + subscribe CTA. 100-200 words. Plain ASCII.' }),
    Email: `  "Email": {
    "endUser": {
      "subject": WRITE an email subject for end users, under 10 words. Plain ASCII.,
      "preheader": WRITE preview text for end users, under 12 words.,
      "body": WRITE a 200-300 word email body for end users. Professional, benefit-led, written to employees or facility managers who will use this feature daily. Plain ASCII only.,
      "cta1": "[SCHEDULE A DEMO - INSERT LINK]",
      "cta2": "[LEARN MORE - INSERT LINK]"${makeVerticalEmailsSnippet('end users', 'LEARN MORE')}
    },
    "channelPartner": {
      "subject": WRITE an email subject for integrators and channel partners, under 10 words. Plain ASCII.,
      "preheader": WRITE preview text for partners, under 12 words.,
      "body": WRITE a 200-300 word email body for integrators and channel partners. Technical, enablement-focused, written to help them sell and deploy this feature for their clients. Plain ASCII only.,
      "cta1": "[SCHEDULE A PARTNER BRIEFING - INSERT LINK]",
      "cta2": "[ACCESS PARTNER RESOURCES - INSERT LINK]"${makeVerticalEmailsSnippet('integrators serving', 'PARTNER RESOURCES')}
    }
  }`,
  };

  const schemaBody = channels.map(ch => channelSchemas[ch]).join(',\n');

  // Competitive context block
  const competitorLines = (competitors || []).map(c =>
    `  - ${c.name}: ${c.hasFeature === 'yes' ? 'Has this feature' : c.hasFeature === 'no' ? 'Does NOT have this feature' : 'Unknown'}`
  ).join('\n');
  const competitorSection = competitorLines
    ? `\nCompetitive Context:\n  Position: ${competitivePosition || 'Unknown'}\n${competitorLines}\n  Tone: ${
        competitivePosition === 'Market Leader'
          ? 'Lead with innovation — we are first or ahead. Bold, pioneering language.'
          : competitivePosition === 'Industry Parity'
          ? 'We match the industry standard. Focus on implementation quality and what this unlocks next.'
          : 'Differentiated feature in a mixed landscape. Highlight our unique approach.'
      }`
    : '';

  // Playbook brief block
  const briefSection = (playbookBrief?.keyMessage || playbookBrief?.proofPoints || playbookBrief?.avoid)
    ? `\nMarketing Brief (follow these instructions closely):\n${
        playbookBrief.keyMessage  ? `  Key message: ${playbookBrief.keyMessage}\n`  : ''
      }${playbookBrief.proofPoints ? `  Proof points to include: ${playbookBrief.proofPoints}\n` : ''
      }${playbookBrief.avoid      ? `  Avoid / do not mention: ${playbookBrief.avoid}\n`        : ''}`
    : '';

  const verticalSection = verticals.length
    ? `\nTarget Verticals: ${verticals.join(', ')}\nFor each vertical, write a 1-sentence tailored angle in "verticalAngles" showing how this feature solves that vertical's specific pain point.`
    : '';

  const prompt = `You are a product marketing expert at Genea Security. Write social media copy for this product release.

Product: ${productName}
Suite: ${productSuite}
Release Date: ${releaseDate}
Tier: ${tierLevel}
Tier guidance: ${tierGuidance}
Summary: ${productInformation}
End User Value: ${endUserWhy}${briefSection}${competitorSection}${verticalSection}

IMPORTANT: Use plain ASCII text only. No smart quotes, em-dashes, special arrows, bullets, or Unicode outside basic ASCII.

Return ONLY valid JSON. No markdown, no code blocks, no explanation. Only include the channels listed below:

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
        max_tokens: 2800,
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
