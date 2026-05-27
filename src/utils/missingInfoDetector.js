export function detectMissingInfo(release) {
  const missing = [];
  if (!release.productName) missing.push({ field: 'productName', question: 'What is the name of this product or feature?' });
  if (!release.releaseDate) missing.push({ field: 'releaseDate', question: 'What is the planned release date?' });
  if (!release.productSuite) missing.push({ field: 'productSuite', question: 'Which Genea product suite does this belong to?' });
  if (!release.productInformation || release.productInformation.length < 50) missing.push({ field: 'productInformation', question: 'Can you provide more detail about what this release includes?' });
  if (!release.endUserWhat) missing.push({ field: 'endUserWhat', question: 'What is this feature from the end user perspective?' });
  if (!release.endUserWho) missing.push({ field: 'endUserWho', question: 'Who is the primary end user for this feature?' });
  if (!release.endUserWhy) missing.push({ field: 'endUserWhy', question: 'Why does this matter to the end user?' });
  if (!release.partnerWhat) missing.push({ field: 'partnerWhat', question: 'What does this mean for integrators and partners?' });
  return missing;
}
