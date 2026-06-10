import { useState, useRef, useEffect } from 'react';
import { researchCompetitors } from '../utils/aiGenerator';

const CONFIDENCE_STYLE = {
  high:   { bg: 'bg-green-100', text: 'text-green-700', label: 'High'   },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  low:    { bg: 'bg-gray-100',  text: 'text-gray-500',  label: 'Low'    },
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
  yes:     { label: 'Has it',   bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200'   },
  no:      { label: "Doesn't",  bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200' },
  unknown: { label: 'Unknown',  bg: 'bg-gray-100',  text: 'text-gray-500',  border: 'border-gray-200'  },
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
  'Market Leader':           { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Market Leader — Genea is ahead'            },
  'Emerging Differentiator': { bg: 'bg-blue-100',  text: 'text-blue-800',  border: 'border-blue-300',  label: 'Emerging Differentiator — Mixed landscape'  },
  'Industry Parity':         { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', label: 'Industry Parity — Table stakes feature'     },
};

export default function CompetitorSelector({ competitors = [], onChange, featureDescription = '', productDescription = '' }) {
  const [customInput, setCustomInput] = useState('');
  const [showAll, setShowAll]         = useState(false);
  const [searching, setSearching]     = useState(new Set()); // names currently being searched
  const [reSearchAll, setReSearchAll] = useState(false);

  // Always have the latest competitors in async closures
  const competitorsRef = useRef(competitors);
  useEffect(() => { competitorsRef.current = competitors; }, [competitors]);

  const selectedNames = new Set(competitors.map(c => c.name));
  const visibleKnown  = showAll ? KNOWN_COMPETITORS : KNOWN_COMPETITORS.slice(0, 6);

  // ── Auto-search a single competitor ─────────────────────────────
  async function autoSearch(name) {
    setSearching(prev => new Set([...prev, name]));
    try {
      const result = await researchCompetitors({
        feature: featureDescription || name,
        productDescription,
        competitors: [{ name }],
      });
      const found = result.competitors?.[0];
      if (found) {
        // Use ref to get latest array (avoids stale closure)
        onChange(competitorsRef.current.map(c =>
          c.name === name
            ? { ...c, hasFeature: found.hasFeature, confidence: found.confidence, reason: found.reason, sources: found.sources }
            : c
        ));
      }
    } catch {
      // silently fail — competitor stays at 'unknown'
    } finally {
      setSearching(prev => { const n = new Set(prev); n.delete(name); return n; });
    }
  }

  function toggle(name) {
    if (selectedNames.has(name)) {
      onChange(competitors.filter(c => c.name !== name));
    } else {
      onChange([...competitors, { name, hasFeature: 'unknown' }]);
      autoSearch(name);
    }
  }

  function updateStatus(name, hasFeature) {
    onChange(competitors.map(c => c.name === name ? { ...c, hasFeature } : c));
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || selectedNames.has(name)) return;
    onChange([...competitors, { name, hasFeature: 'unknown' }]);
    autoSearch(name);
    setCustomInput('');
  }

  async function reSearchAllCompetitors() {
    setReSearchAll(true);
    await Promise.all(competitors.map(c => autoSearch(c.name)));
    setReSearchAll(false);
  }

  const position = computeCompetitivePosition(competitors);
  const anySearching = searching.size > 0 || reSearchAll;

  return (
    <div className="space-y-4">
      {/* Known competitor chips */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Select competitors — Serper searches each one automatically:</p>
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

      {/* Selected competitors */}
      {competitors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-genea-navy uppercase tracking-wide">Feature parity</p>
            {competitors.length > 1 && (
              <button
                type="button"
                onClick={reSearchAllCompetitors}
                disabled={anySearching}
                className="flex items-center gap-1 text-xs text-genea-bright hover:text-genea-blue transition-colors disabled:opacity-40"
                title="Re-search all with Serper"
              >
                <svg className={`w-3.5 h-3.5 ${anySearching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-search all
              </button>
            )}
          </div>

          {competitors.map(({ name, hasFeature, confidence, reason, sources }) => {
            const isSearching = searching.has(name);
            const cfg = STATUS_CONFIG[hasFeature] || STATUS_CONFIG.unknown;
            const conf = confidence ? CONFIDENCE_STYLE[confidence] : null;

            return (
              <div key={name} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  {/* Name */}
                  <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">{name}</span>

                  {/* Status or spinner */}
                  {isSearching ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Status buttons */}
                      <div className="flex gap-1">
                        {Object.entries(STATUS_CONFIG).map(([status, scfg]) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateStatus(name, status)}
                            className={`px-2 py-0.5 text-xs rounded-lg font-medium border transition-all ${
                              hasFeature === status
                                ? `${scfg.bg} ${scfg.text} ${scfg.border}`
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {scfg.label}
                          </button>
                        ))}
                      </div>
                      {/* Confidence badge */}
                      {conf && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${conf.bg} ${conf.text}`} title={reason || ''}>
                          {conf.label}
                        </span>
                      )}
                      {/* Re-search single */}
                      <button
                        type="button"
                        onClick={() => autoSearch(name)}
                        className="text-gray-300 hover:text-genea-bright transition-colors ml-0.5"
                        title="Re-search this competitor"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onChange(competitors.filter(c => c.name !== name))}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 text-base leading-none ml-0.5"
                  >
                    ×
                  </button>
                </div>

                {/* Reason + sources (shown after search) */}
                {!isSearching && reason && (
                  <div className="px-3 pb-2.5 flex items-start gap-2">
                    <p className="text-xs text-gray-500 leading-snug flex-1">{reason}</p>
                    {sources?.length > 0 && (
                      <div className="flex gap-2 flex-shrink-0">
                        {sources.slice(0, 2).map((url, i) => {
                          let hostname = url;
                          try { hostname = new URL(url).hostname; } catch {}
                          return (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-genea-bright hover:underline">
                              {hostname}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Position badge */}
          {position && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mt-1 ${POSITION_STYLE[position].bg} ${POSITION_STYLE[position].text} ${POSITION_STYLE[position].border}`}>
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
