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
      competitors: release.competitors || [],
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
