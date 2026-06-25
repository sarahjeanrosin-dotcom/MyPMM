const FIELD_PROMPTS = {
  icpFirmographic: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control and smart building company.

Generate an Ideal Customer Profile (ICP) description for "${r.productName}" (${r.productSuite}).

Product context: ${r.productInformation}

Write 2-3 sentences covering: company type, size range (employees or doors), industry verticals, geography, and tech environment. Be specific and practical. Output only the ICP description, no preamble.`,

  qualifyingTriggers: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

List 4-6 qualifying buying signals or triggers that indicate an account is actively in-market for "${r.productName}".

Product context: ${r.productInformation}
End user context: ${r.endUserWhy || ''}

Format as a comma-separated list of short phrases. Output only the list, no preamble.`,

  disqualifiers: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

List 3-5 disqualifiers — account types or situations that are NOT a good fit for "${r.productName}".

Product context: ${r.productInformation}

Format as a comma-separated list of short phrases. Output only the list, no preamble.`,

  primaryPersonas: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

List 2-3 primary buyer personas for "${r.productName}" with their job titles and their #1 concern.

Product context: ${r.productInformation}
End user context: ${r.endUserWho || ''}

Format each as: "[Title] — [key concern]". One per line. Output only the personas, no preamble.`,

  secondaryPersonas: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

List 1-2 secondary or influencer personas for "${r.productName}" — people who influence the buying decision but are not the primary buyer.

Product context: ${r.productInformation}

Format each as: "[Title] — [their angle]". One per line. Output only the personas, no preamble.`,

  painsJTBD: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

List the top 3-4 pains or jobs-to-be-done that "${r.productName}" solves, written from the buyer's perspective.

Product context: ${r.productInformation}
End user context: ${r.endUserWhy || ''}

Format each as: "[Persona]: [pain or job]". One per line. Output only the pains, no preamble.`,

  valueProposition: (r) => `You are a B2B positioning strategist for Genea, an enterprise access control company.

Write a single-sentence value proposition for "${r.productName}".

Product context: ${r.productInformation}
End user: ${r.endUserWho || ''} — ${r.endUserWhy || ''}

Use the pattern: "[Product] is the only [category] that [unique benefit] for [target customer]."
Output only the sentence, no preamble.`,

  messagingPillars: (r) => `You are a B2B positioning strategist for Genea, an enterprise access control company.

Generate exactly 3 messaging pillars for "${r.productName}". Each pillar is a short strategic headline with a one-sentence proof point.

Product context: ${r.productInformation}
End user: ${r.endUserWhy || ''}

Return ONLY a valid JSON array in this exact format, no other text:
[{"pillar":"...","proof":"..."},{"pillar":"...","proof":"..."},{"pillar":"...","proof":"..."}]`,

  differentiation: (r) => {
    const compList = (r.competitors || []).map(c => c.name).join(', ');
    return `You are a B2B positioning strategist for Genea, an enterprise access control company.

Write one sentence explaining how "${r.productName}" is differentiated from competitors.

Product context: ${r.productInformation}
${compList ? `Competitors in this space: ${compList}` : ''}

Be specific — name a capability or approach that sets Genea apart. Output only the sentence, no preamble.`;
  },

  keyBenefits: (r) => `You are a B2B demand gen strategist for Genea, an enterprise access control company.

Generate 4 key benefits for "${r.productName}" as feature-to-buyer-outcome mappings.

Product context: ${r.productInformation}
End user: ${r.endUserWhat || ''} — ${r.endUserWhy || ''}

Return ONLY a valid JSON array in this exact format, no other text:
[{"feature":"...","outcome":"..."},{"feature":"...","outcome":"..."},{"feature":"...","outcome":"..."},{"feature":"...","outcome":"..."}]`,

  competitiveWedge: (r) => {
    const compList = (r.competitors || []).map(c => c.name).join(', ');
    return `You are a B2B sales strategist for Genea, an enterprise access control company.

Write 1-2 sentences describing the competitive wedge for "${r.productName}" — the specific capability or position that wins deals.

Product context: ${r.productInformation}
${compList ? `Key competitors: ${compList}` : ''}

Be direct and specific. Output only the wedge statement, no preamble.`;
  },

  topObjections: (r) => `You are a B2B sales enablement strategist for Genea, an enterprise access control company.

List the top 3 sales objections buyers will have about "${r.productName}" and a brief counter for each.

Product context: ${r.productInformation}

Format each as: "Objection: [objection] → Counter: [counter]". One per line. Output only the objections, no preamble.`,
};

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { fieldKey, release } = body;
  const promptFn = FIELD_PROMPTS[fieldKey];
  if (!promptFn) {
    return new Response(JSON.stringify({ error: `Unknown field: ${fieldKey}` }), { status: 400 });
  }

  const isJson = fieldKey === 'messagingPillars' || fieldKey === 'keyBenefits';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: isJson ? 600 : 350,
        messages: [{ role: 'user', content: promptFn(release) }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '';

    if (isJson) {
      try {
        const parsed = JSON.parse(raw);
        return new Response(JSON.stringify({ suggestion: parsed }), { status: 200 });
      } catch {
        return new Response(JSON.stringify({ error: 'AI returned malformed JSON', raw }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ suggestion: raw }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
