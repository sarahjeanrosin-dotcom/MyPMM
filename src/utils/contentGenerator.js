export function generateProductBriefContent(release) {
  return {
    title: `Product Brief: ${release.productName}`,
    productSuite: release.productSuite,
    releaseDate: release.releaseDate,
    relatedReleases: release.relatedReleases,
    summary: release.productInformation,
    roadmapItems: release.roadmapItems,
    endUser: {
      what: release.endUserWhat,
      who: release.endUserWho,
      why: release.endUserWhy,
    },
    partner: {
      what: release.partnerWhat,
      who: release.partnerWho,
      why: release.partnerWhy,
    },
    helpCenterUrl: release.helpCenterUrl,
    additionalResources: release.additionalResources,
  };
}

export function generateMarketingPlaybookContent(release) {
  const tier = release.tierLevel;
  const ai = release.marketingCopy;

  const fallback = {
    LinkedIn: {
      headline: `Introducing ${release.productName} — The Future of ${release.productSuite}`,
      copy: `We're excited to announce ${release.productName}.\n\n${release.productInformation}\n\nAvailable ${release.releaseDate}. Learn more at getgenea.com.`,
      cta: 'Learn More at getgenea.com',
      visualDirection: 'Clean product screenshot or animated demo GIF on Genea navy background. Bold headline overlay.',
      audienceNotes: 'Target: Security directors, IT managers, facility operations leads. Tone: Professional, confident, innovation-forward.',
    },
    Instagram: {
      headline: 'Access just got smarter.',
      copy: `${release.productName} is here.\n\n${release.endUserWhy || 'Seamless access for modern workplaces.'}\n\nLink in bio.`,
      cta: 'Link in bio → getgenea.com',
      visualDirection: 'Short-form video or motion graphic. 9:16 vertical. Use Genea blue gradient with product UI overlay.',
      audienceNotes: 'Broader awareness play. Focus on the user benefit, not technical specs. Keep copy short and punchy.',
    },
    YouTube: {
      headline: `${release.productName} — Product Overview`,
      copy: `In this video, we walk through everything new in ${release.productName}.\n\nTopics covered:\n• What's new\n• Who it's for\n• How to get started\n\nSubscribe for more Genea product updates.`,
      cta: 'Subscribe + Enable notifications',
      visualDirection: '16:9 product demo video. Screen recording with voiceover. Open on Genea branded intro card. Close with CTA card.',
      audienceNotes: 'Mix of existing customers (retention/expansion) and prospects evaluating Genea. Include both end-user and admin perspective.',
    },
  };

  const channels = {};
  for (const channel of ['LinkedIn', 'Instagram', 'YouTube']) {
    channels[channel] = (ai && ai[channel]) ? ai[channel] : fallback[channel];
  }

  return { title: `Marketing Playbook: ${release.productName}`, tier, channels };
}
