export async function researchCompetitors({ feature, productDescription, competitors }) {
  const res = await fetch('/api/researchCompetitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature,
      productDescription,
      competitorNames: competitors.map(c => c.name),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function processRawRelease(rawText, tierLevel = 'Tier 2') {
  const res = await fetch('/api/processRelease', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, tierLevel }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function generateMarketingCopy(release) {
  // Derive channel list from granular selectedCollateral
  const CHANNEL_MAP = { linkedin: 'LinkedIn', instagram: 'Instagram', youtube: 'YouTube', email: 'Email', inapp: 'InApp' };
  const selectedCollateral = release.selectedCollateral || [];
  const selectedChannels = selectedCollateral
    .filter(c => c in CHANNEL_MAP)
    .map(c => CHANNEL_MAP[c]);

  const res = await fetch('/api/generateMarketingCopy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: release.productName,
      productSuite: release.productSuite,
      releaseDate: release.releaseDate,
      productInformation: release.productInformation,
      endUserWhy: release.endUserWhy,
      tierLevel: release.tierLevel,
      selectedChannels,
      competitors: release.competitors || [],
      playbookBrief: release.playbookBrief || {},
      targetVerticals: release.targetVerticals || [],
      launchContext: release.launchContext || '',
      competitivePosition: release.competitors?.length
        ? (() => {
            const known = (release.competitors || []).filter(c => c.hasFeature !== 'unknown');
            if (!known.length) return null;
            const withFeature = known.filter(c => c.hasFeature === 'yes').length;
            const ratio = withFeature / known.length;
            if (ratio <= 0.25) return 'Market Leader';
            if (ratio >= 0.75) return 'Industry Parity';
            return 'Emerging Differentiator';
          })()
        : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export async function generateDgSuggestion(fieldKey, release) {
  const res = await fetch('/.netlify/functions/generateDgSuggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fieldKey,
      release: {
        productName: release.productName,
        productSuite: release.productSuite,
        productInformation: release.productInformation,
        endUserWhat: release.endUserWhat,
        endUserWho: release.endUserWho,
        endUserWhy: release.endUserWhy,
        competitors: release.competitors,
        tierLevel: release.tierLevel,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  const data = await res.json();
  return data.suggestion;
}

export async function generateWhoWhatWhy(release) {
  const res = await fetch('/api/generateWhoWhatWhy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: release.productName,
      productSuite: release.productSuite,
      releaseDate: release.releaseDate,
      productInformation: release.productInformation,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}
