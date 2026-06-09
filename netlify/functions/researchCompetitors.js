const SERPER_URL = 'https://google.serper.dev/search';

async function serperSearch(query, apiKey) {
  try {
    const res = await fetch(SERPER_URL, {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 4 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic || []).slice(0, 4).map(r => ({
      title:   r.title   || '',
      snippet: r.snippet || '',
      url:     r.link    || '',
    }));
  } catch {
    return [];
  }
}

async function searchCompetitor(name, feature, serperKey) {
  const [results1, results2] = await Promise.all([
    serperSearch(`"${name}" ${feature} access control`, serperKey),
    serperSearch(`"${name}" ${feature} product roadmap`, serperKey),
  ]);
  return { name, results: [...results1, ...results2] };
}

function formatEvidence(competitorData) {
  return competitorData.map(({ name, results }) => {
    if (!results.length) return `${name}:\n  (no search results found)\n`;
    const lines = results.map((r, i) =>
      `  [${i + 1}] ${r.title}\n       ${r.snippet}\n       ${r.url}`
    ).join('\n');
    return `${name}:\n${lines}`;
  }).join('\n\n---\n\n');
}

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const serperKey    = process.env.SERPER_API_KEY;

  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured.' }), { status: 500 });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  const { feature, productDescription, competitorNames } = body;

  if (!competitorNames?.length) {
    return new Response(JSON.stringify({ competitors: [] }), { status: 200 });
  }

  // ── Step 1: Serper searches (2 per competitor, all in parallel) ──
  let competitorEvidence;
  if (serperKey) {
    const searchPromises = competitorNames.map(name =>
      searchCompetitor(name, feature || 'this feature', serperKey)
    );
    competitorEvidence = await Promise.all(searchPromises);
  } else {
    // No Serper key — fall back to training-data-only mode
    competitorEvidence = competitorNames.map(name => ({ name, results: [] }));
  }

  const hasSearchResults = competitorEvidence.some(c => c.results.length > 0);

  // ── Step 2: Claude interprets the evidence ───────────────────────
  const evidenceBlock = formatEvidence(competitorEvidence);

  const prompt = hasSearchResults
    ? `You are an access control industry analyst. Based on these REAL-TIME web search results, determine whether each company has a feature similar to: "${feature || 'this feature'}"

Product context: ${productDescription || ''}

For each competitor you have search snippets from two queries:
1. "[Company] ${feature} access control"
2. "[Company] ${feature} product roadmap"

SEARCH EVIDENCE:
---
${evidenceBlock}
---

Analyze the evidence carefully. For each company:
- hasFeature: "yes" if the snippets confirm they have something meaningfully similar; "no" if snippets or absence of results suggests they don't; "unknown" if genuinely unclear
- confidence: "high" (direct product page or announcement), "medium" (indirect references), "low" (no strong evidence)
- reason: one sentence citing what you found in the search results (or lack thereof). Max 20 words. Plain ASCII only.
- sources: up to 2 relevant URLs from the search results (empty array if none)

Return ONLY valid JSON, no markdown:
{"competitors": [{"name": "...", "hasFeature": "yes/no/unknown", "confidence": "high/medium/low", "reason": "...", "sources": ["url1"]}]}`
    : `You are an access control industry analyst. Based on your training knowledge, estimate whether each company has a feature similar to: "${feature || 'this feature'}"

Product context: ${productDescription || ''}

(Note: No live search results were available — estimating from training data.)

Companies: ${competitorNames.join(', ')}

Return ONLY valid JSON, no markdown:
{"competitors": [{"name": "...", "hasFeature": "yes/no/unknown", "confidence": "high/medium/low", "reason": "...", "sources": []}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
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

    const data  = await response.json();
    const text  = ('{"competitors":' + data.content[0].text).trim();
    const result = JSON.parse(text.replace(/^```json\n?/, '').replace(/\n?```$/, ''));

    // Tag whether results came from live search or training data
    result.searchUsed = hasSearchResults;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Research failed.' }), { status: 500 });
  }
}
