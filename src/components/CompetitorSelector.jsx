import { useState } from 'react';

const KNOWN_COMPETITORS = [
  'Openpath (Assa Abloy)',
  'HID Global',
  'Brivo',
  'Verkada',
  'Allegion',
  'Gallagher',
  'LenelS2 (Carrier)',
  'Johnson Controls',
  'Honeywell',
  'Genetec',
  'Feenics (Motorola)',
  'CCURE / Software House',
];

const STATUS_CONFIG = {
  yes:     { label: 'Has it',    bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200'   },
  no:      { label: "Doesn't",   bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200' },
  unknown: { label: 'Unknown',   bg: 'bg-gray-100',  text: 'text-gray-500',  border: 'border-gray-200'  },
};

export function computeCompetitivePosition(competitors) {
  if (!competitors || competitors.length === 0) return null;
  const known = competitors.filter(c => c.hasFeature !== 'unknown');
  if (known.length === 0) return null;
  const withFeature = known.filter(c => c.hasFeature === 'yes').length;
  const ratio = withFeature / known.length;
  if (ratio <= 0.25) return 'Market Leader';
  if (ratio >= 0.75) return 'Industry Parity';
  return 'Emerging Differentiator';
}

export const POSITION_STYLE = {
  'Market Leader':          { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300',  label: 'Market Leader — Genea is ahead'           },
  'Emerging Differentiator':{ bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300',   label: 'Emerging Differentiator — Mixed landscape' },
  'Industry Parity':        { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-300',  label: 'Industry Parity — Table stakes feature'    },
};

export default function CompetitorSelector({ competitors = [], onChange }) {
  const [customInput, setCustomInput] = useState('');
  const [showAll, setShowAll] = useState(false);

  const visibleKnown = showAll ? KNOWN_COMPETITORS : KNOWN_COMPETITORS.slice(0, 6);
  const selectedNames = new Set(competitors.map(c => c.name));

  function toggle(name) {
    if (selectedNames.has(name)) {
      onChange(competitors.filter(c => c.name !== name));
    } else {
      onChange([...competitors, { name, hasFeature: 'unknown' }]);
    }
  }

  function updateStatus(name, hasFeature) {
    onChange(competitors.map(c => c.name === name ? { ...c, hasFeature } : c));
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || selectedNames.has(name)) return;
    onChange([...competitors, { name, hasFeature: 'unknown' }]);
    setCustomInput('');
  }

  const position = computeCompetitivePosition(competitors);

  return (
    <div className="space-y-4">
      {/* Known competitor chips */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Select competitors to compare:</p>
        <div className="flex flex-wrap gap-2">
          {visibleKnown.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedNames.has(name)
                  ? 'bg-genea-navy text-white border-genea-navy'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-genea-navy hover:text-genea-navy'
              }`}
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-genea-bright hover:text-genea-bright transition-all"
          >
            {showAll ? 'Show less' : `+${KNOWN_COMPETITORS.length - 6} more`}
          </button>
        </div>
      </div>

      {/* Custom competitor input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="Add a competitor not listed..."
          className="genea-input text-sm flex-1 py-2"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-genea-navy text-white hover:bg-genea-blue disabled:bg-gray-200 disabled:text-gray-400 transition-all"
        >
          Add
        </button>
      </div>

      {/* Selected competitors — feature status */}
      {competitors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-genea-navy uppercase tracking-wide">Does each competitor have this feature?</p>
          {competitors.map(({ name, hasFeature }) => (
            <div key={name} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">{name}</span>
              <div className="flex gap-1.5 flex-shrink-0">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(name, status)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                      hasFeature === status
                        ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onChange(competitors.filter(c => c.name !== name))}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}

          {/* Computed position badge */}
          {position && (
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${POSITION_STYLE[position].bg} ${POSITION_STYLE[position].text} ${POSITION_STYLE[position].border}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {POSITION_STYLE[position].label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
