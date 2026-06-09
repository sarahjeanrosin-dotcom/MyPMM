// collateralDefaults drive the checkbox pre-selection when a tier is chosen.
// Keys: 'brief' | 'linkedin' | 'instagram' | 'youtube' | 'email'
export const tierConfig = {
  'Tier 1': {
    label: 'Tier 1 — Platform-Wide / Critical',
    description: 'Full global campaign + training. All channels, press, and customer comms.',
    commsLevel: 'full',
    collateralDefaults: ['brief', 'linkedin', 'instagram', 'youtube', 'email'],
    channelGuidance: 'Full campaign across all channels. Bold, pioneering language. Broad awareness.',
  },
  'Tier 2': {
    label: 'Tier 2 — Major Feature',
    description: 'ICP-targeted enablement + announcements to strategic accounts.',
    commsLevel: 'targeted',
    collateralDefaults: ['brief', 'linkedin', 'youtube', 'email'],
    channelGuidance: 'Professional, value-focused messaging. Target enterprise IT and security decision-makers.',
  },
  'Tier 3': {
    label: 'Tier 3 — Enhancement / Hardware-Specific',
    description: 'Help Center update + release notes. Limited professional social.',
    commsLevel: 'minimal',
    collateralDefaults: ['brief', 'linkedin'],
    channelGuidance: 'Informational LinkedIn post for the niche audience on this hardware or integration path.',
  },
  'Tier 4': {
    label: 'Tier 4 — Minor / Bug Fix',
    description: 'Release notes only. No proactive customer communication required.',
    commsLevel: 'none',
    collateralDefaults: [],
    channelGuidance: 'Log in release notes only. No social or email campaign needed.',
  },
};

// Map collateral keys → channel names used by the AI generator
export const COLLATERAL_CHANNEL_MAP = {
  linkedin:  'LinkedIn',
  instagram: 'Instagram',
  youtube:   'YouTube',
  email:     'Email',
};

export const COLLATERAL_ITEMS = [
  { key: 'brief',     group: 'document', label: 'Product Brief',    desc: 'For Sales & CS enablement' },
  { key: 'linkedin',  group: 'social',   label: 'LinkedIn Post',     desc: 'Professional B2B copy' },
  { key: 'instagram', group: 'social',   label: 'Instagram Post',    desc: 'Visual, benefit-led copy' },
  { key: 'youtube',   group: 'social',   label: 'YouTube Script',    desc: 'Video description + CTA' },
  { key: 'email',     group: 'email',    label: 'Email Copy',        desc: 'General + verticalized with KBA links' },
];
