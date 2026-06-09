import { useState } from 'react';
import { researchCompetitors } from '../utils/aiGenerator';

const CONFIDENCE_STYLE = {
  high:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'High confidence'   },
  medium:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Medium confidence' },
  low:     { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Low confidence'    },
};

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

export default function CompetitorSelector({ competitors = [], onChange, featureDescription = '', productDescription = '' }) {
  const [customInput, setCustomInput]     = useState('');
  const [showAll, setShowAll]             = useState(false);
  const [researchState, setResearchState] = useState('idle'); // idle | loading | results | error
  const [researchResults, setResearchResults] = useState([]);
  const [researchError, setResearchError] = useState('');

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

  async function handleResearch() {
    if (!competitors.length) return;
    setResearchState('loading');
    setResearchError('');
    try {
      const result = await researchCompetitors({
        feature: featureDescription || 'this feature',
        productDescription,
        competitors,
      });
      const list = result.competitors || [];
      list._searchUsed = result.searchUsed;
      setResearchResults(list);
      setResearchState('results');
    } catch (err) {
      setResearchError(err.message || 'Research failed.');
      setResearchState('error');
    }
  }

  function applyResearch() {
    const merged = competitors.map(c => {
      const found = researchResults.find(r => r.name === c.name);
      return found ? { ...c, hasFeature: found.hasFeature } : c;
    });
    onChange(merged);
    setResearchState('idle');
    setResearchResults([]);
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

          {/* Research button */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleResearch}
              disabled={researchState === 'loading'}
              className="flex items-center gap-2 text-sm font-semibold text-genea-bright hover:text-genea-blue transition-colors disabled:opacity-50"
            >
              {researchState === 'loading' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {researchState === 'loading' ? 'Researching with Claude...' : 'Research parity with Claude'}
            </button>
            <p className="text-xs text-gray-400 mt-1">Claude estimates from training data — review before applying.</p>
          </div>

          {/* Research results */}
          {researchState === 'results' && researchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-genea-navy uppercase tracking-wide">
                  {researchResults._searchUsed !== false
                    ? 'Live search results — review before applying'
                    : 'Training data estimates — review before applying'}
                </p>
                {researchResults._searchUsed !== false ? (
                  <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    Live search
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                    Training data
                  </span>
                )}
              </div>
              {researchResults.map(({ name, hasFeature, confidence, reason, sources }) => {
                const conf = CONFIDENCE_STYLE[confidence] || CONFIDENCE_STYLE.low;
                const s = STATUS_CONFIG[hasFeature] || STATUS_CONFIG.unknown;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-medium text-gray-700 w-32 flex-shrink-0 truncate">{name}</span>
                      <span className={`px-2 py-0.5 rounded font-semibold border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
                      <span className={`px-2 py-0.5 rounded font-medium flex-shrink-0 ${conf.bg} ${conf.text}`}>{confidence}</span>
                      <span className="text-gray-500 leading-tight">{reason}</span>
                    </div>
                    {sources?.length > 0 && (
                      <div className="ml-32 flex flex-wrap gap-1">
                        {sources.slice(0, 2).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-genea-bright hover:underline truncate max-w-xs"
                          >
                            {new URL(url).hostname}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={applyResearch}
                  className="px-3 py-1.5 bg-genea-navy text-white text-xs font-semibold rounded-lg hover:bg-genea-blue transition-colors"
                >
                  Apply estimates
                </button>
                <button
                  type="button"
                  onClick={() => setResearchState('idle')}
                  className="px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {researchState === 'error' && (
            <p className="text-xs text-red-500 mt-2">{researchError}</p>
          )}
        </div>
      )}
    </div>
  );
}
