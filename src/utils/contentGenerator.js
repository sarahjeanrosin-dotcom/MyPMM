import { tierConfig, COLLATERAL_CHANNEL_MAP } from '../config/tierConfig';
import { computeCompetitivePosition } from '../components/CompetitorSelector';

// Normalize old 'playbook' format → channel keys
function normalizeCollateral(collateral, tierLevel) {
  if (!collateral || collateral.length === 0) {
    return tierConfig[tierLevel]?.collateralDefaults || ['brief', 'linkedin', 'youtube'];
  }
  // Migrate old ['brief','playbook'] format
  if (collateral.includes('playbook') && !collateral.some(c => c in COLLATERAL_CHANNEL_MAP)) {
    return tierConfig[tierLevel]?.collateralDefaults || ['brief', 'linkedin', 'youtube'];
  }
  return collateral;
}

export function generateProductBriefContent(release) {
  const competitors = release.competitors || [];
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
    competitiveContext: competitors.length > 0 ? {
      competitors,
      position: computeCompetitivePosition(competitors),
    } : null,
  };
}

export function generateMarketingPlaybookContent(release) {
  const tier = release.tierLevel;
  const config = tierConfig[tier] || tierConfig['Tier 2'];
  const ai = release.marketingCopy;

  const collateral = normalizeCollateral(release.selectedCollateral, tier);
  const selectedChannels = collateral
    .filter(c => c in COLLATERAL_CHANNEL_MAP)
    .map(c => COLLATERAL_CHANNEL_MAP[c]);

  if (selectedChannels.length === 0) {
    return { title: `Marketing Playbook: ${release.productName}`, tier, commsLevel: 'none', channels: {} };
  }

  const fallback = {
    LinkedIn: {
      headline: `Introducing ${release.productName} -- The Future of ${release.productSuite}`,
      copy: `We're excited to announce ${release.productName}.\n\n${release.productInformation}\n\nAvailable ${release.releaseDate}. Learn more at getgenea.com.`,
      cta: 'Learn More at getgenea.com',
      visualDirection: 'Clean product screenshot or animated demo GIF on Genea navy background. Bold headline overlay.',
      audienceNotes: 'Target: Security directors, IT managers, facility operations leads. Tone: Professional, confident, innovation-forward.',
    },
    Instagram: {
      headline: 'Access just got smarter.',
      copy: `${release.productName} is here.\n\n${release.endUserWhy || 'Seamless access for modern workplaces.'}\n\nLink in bio.`,
      cta: 'Link in bio -> getgenea.com',
      visualDirection: 'Short-form video or motion graphic. 9:16 vertical. Use Genea blue gradient with product UI overlay.',
      audienceNotes: 'Broader awareness play. Focus on the user benefit, not technical specs. Keep copy short and punchy.',
    },
    YouTube: {
      headline: `${release.productName} -- Product Overview`,
      copy: `In this video, we walk through everything new in ${release.productName}.\n\nTopics covered:\n- What's new\n- Who it's for\n- How to get started\n\nSubscribe for more Genea product updates.`,
      cta: 'Subscribe and enable notifications',
      visualDirection: '16:9 product demo video. Screen recording with voiceover. Open on Genea branded intro card. Close with CTA card.',
      audienceNotes: 'Mix of existing customers (retention/expansion) and prospects evaluating Genea.',
    },
    Email: {
      endUser: {
        subject: `Introducing ${release.productName}`,
        preheader: release.endUserWhy || 'Now available for your team.',
        body: `Hi [First Name],\n\nWe're excited to share that ${release.productName} is now available.\n\n${release.productInformation}\n\nThis means your team can now [KEY BENEFIT]. Available to all customers effective [DATE].\n\nYour Customer Success Manager will be in touch with next steps. Questions? Reply to this email.\n\nBest,\nThe Genea Team`,
        cta1: '[SCHEDULE A DEMO - INSERT LINK]',
        cta2: '[LEARN MORE - INSERT LINK]',
        verticalEmails: [],
      },
      channelPartner: {
        subject: `New: ${release.productName} — Partner Briefing`,
        preheader: 'New feature your clients need to know about.',
        body: `Hi [Partner Name],\n\nWe're launching ${release.productName} and wanted to brief you first.\n\n${release.productInformation}\n\nFor your clients, this means [CUSTOMER VALUE]. As a Genea partner, you have early access to deployment resources, technical documentation, and sales enablement materials.\n\nSchedule a partner briefing to get up to speed before we announce broadly.\n\nBest,\nThe Genea Partner Team`,
        cta1: '[SCHEDULE A PARTNER BRIEFING - INSERT LINK]',
        cta2: '[ACCESS PARTNER RESOURCES - INSERT LINK]',
        verticalEmails: [],
      },
    },
  };

  const channels = {};
  for (const channel of selectedChannels) {
    channels[channel] = (ai && ai[channel]) ? ai[channel] : (fallback[channel] || {});
  }

  return { title: `Marketing Playbook: ${release.productName}`, tier, commsLevel: config.commsLevel, channels };
}
