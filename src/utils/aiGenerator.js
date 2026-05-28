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
