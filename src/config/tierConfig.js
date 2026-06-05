export const tierConfig = {
  'Tier 1': {
    label: 'Tier 1 — Platform-Wide / Critical',
    description: 'Full global campaign + training. All channels, press, and customer comms.',
    channels: ['LinkedIn', 'Instagram', 'YouTube'],
    commsLevel: 'full',
    channelGuidance: 'Full social campaign across all channels. Bold, exciting, broad awareness. Webinar and email campaigns.',
  },
  'Tier 2': {
    label: 'Tier 2 — Major Feature',
    description: 'ICP-targeted enablement + announcements to strategic accounts.',
    channels: ['LinkedIn', 'YouTube'],
    commsLevel: 'targeted',
    channelGuidance: 'Professional, value-focused messaging on LinkedIn and YouTube. Target enterprise IT and security decision-makers.',
  },
  'Tier 3': {
    label: 'Tier 3 — Enhancement / Hardware-Specific',
    description: 'Help Center update + release notes. Limited professional social.',
    channels: ['LinkedIn'],
    commsLevel: 'minimal',
    channelGuidance: 'Informational/technical LinkedIn post for niche audiences using this hardware or integration path.',
  },
  'Tier 4': {
    label: 'Tier 4 — Minor / Bug Fix',
    description: 'Release notes only. No proactive customer communication required.',
    channels: [],
    commsLevel: 'none',
    channelGuidance: 'Log in release notes. No social or email campaign needed.',
  },
};
