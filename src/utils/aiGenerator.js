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
