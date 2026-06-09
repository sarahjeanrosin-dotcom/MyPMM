import { useState, useRef } from 'react';
import TierSelector from './TierSelector';
import CompetitorSelector from './CompetitorSelector';
import VerticalSelector from './VerticalSelector';
import { processRawRelease } from '../utils/aiGenerator';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

function DateField({ value, onChange }) {
  const [mode, setMode] = useState(() => {
    if (!value) return 'specific';
    return /^Q[1-4]-\d{4}$/.test(value) ? 'window' : 'specific';
  });

  const [q, setQ] = useState(() => {
    const m = (value || '').match(/^(Q[1-4])-(\d{4})$/);
    return m ? m[1] : 'Q3';
  });
  const [yr, setYr] = useState(() => {
    const m = (value || '').match(/^Q[1-4]-(\d{4})$/);
    return m ? m[1] : String(CURRENT_YEAR + 1);
  });

  function setWindow(newQ, newYr) {
    onChange(`${newQ}-${newYr}`);
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit mb-2">
        {[
          { id: 'specific', label: 'Exact date' },
          { id: 'window',   label: 'Quarter' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setMode(id); if (id === 'window') setWindow(q, yr); else onChange(''); }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              mode === id ? 'bg-white text-genea-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'specific' ? (
        <input
          type="date"
          value={value && !/^Q/.test(value) ? value : ''}
          onChange={e => onChange(e.target.value)}
          className="genea-input py-2 text-sm"
        />
      ) : (
        <div className="flex gap-2">
          <select
            value={q}
            onChange={e => { setQ(e.target.value); setWindow(e.target.value, yr); }}
            className="genea-input py-2 text-sm flex-1"
          >
            {QUARTERS.map(qtr => <option key={qtr}>{qtr}</option>)}
          </select>
          <select
            value={yr}
            onChange={e => { setYr(e.target.value); setWindow(q, e.target.value); }}
            className="genea-input py-2 text-sm flex-1"
          >
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default function RawInputScreen({ onProcessed, onManual }) {
  const [rawText,      setRawText]      = useState('');
  const [productName,  setProductName]  = useState('');
  const [productSuite, setProductSuite] = useState('');
  const [releaseDate,  setReleaseDate]  = useState('');
  const [tierLevel,    setTierLevel]    = useState('Tier 2');
  const [collateral,   setCollateral]   = useState(['brief', 'playbook']);
  const [competitors,    setCompetitors]    = useState([]);
  const [targetVerticals,setTargetVerticals]= useState([]);
  const [playbookBrief,  setPlaybookBrief]  = useState({ keyMessage: '', proofPoints: '', avoid: '' });
  const [state,          setState]          = useState('idle');
  const [error,        setError]        = useState('');
  const [dragging,     setDragging]     = useState(false);
  const dropRef = useRef(null);

  function toggleCollateral(key) {
    setCollateral(c => c.includes(key) ? c.filter(k => k !== key) : [...c, key]);
  }

  async function handleProcess() {
    if (!rawText.trim()) return;
    setState('loading');
    setError('');
    try {
      const result = await processRawRelease(rawText, tierLevel);
      onProcessed({
        ...result,
        tierLevel,
        selectedCollateral: collateral,
        productName:    productName.trim()  || result.productName  || '',
        releaseDate:    releaseDate         || result.releaseDate   || '',
        productSuite:   productSuite.trim() || result.productSuite  || '',
        competitors,
        targetVerticals,
        playbookBrief,
        uploadedFiles: [],
        marketingCopy: result.marketingCopy || null,
      });
    } catch (err) {
      setError(err.message || 'Processing failed. Check your API key in Netlify environment settings.');
      setState('error');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    if (text) { setRawText(text); return; }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = ev => setRawText(ev.target.result);
      reader.readAsText(file);
    }
  }

  const wordCount   = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const canProcess  = rawText.trim().length > 20 && collateral.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-genea-navy">New Release Project</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Fill in what you know, paste your release notes or Teams message, and Claude will do the rest.
        </p>
      </div>

      {/* ── Release Details ─────────────────────────────────────── */}
      <div className="genea-card space-y-4">
        <h3 className="font-bold text-genea-navy text-base flex items-center gap-2">
          <span className="w-6 h-6 bg-genea-navy rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
          Release Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="genea-label">Product / Feature Name</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="e.g. Mobile Credential 3.0"
              className="genea-input text-sm py-2"
            />
          </div>
          <div>
            <label className="genea-label">Product Suite</label>
            <input
              type="text"
              value={productSuite}
              onChange={e => setProductSuite(e.target.value)}
              placeholder="e.g. Genea Access Control"
              className="genea-input text-sm py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="genea-label">Release Date</label>
            <DateField value={releaseDate} onChange={setReleaseDate} />
          </div>
        </div>
      </div>

      {/* ── Tier + Collateral ────────────────────────────────────── */}
      <div className="genea-card space-y-4">
        <h3 className="font-bold text-genea-navy text-base flex items-center gap-2">
          <span className="w-6 h-6 bg-genea-navy rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
          Tier &amp; Marketing Plan
        </h3>

        <div>
          <label className="genea-label">Release Tier</label>
          <div className="mt-1">
            <TierSelector value={tierLevel} onChange={setTierLevel} />
          </div>
        </div>

        <div>
          <label className="genea-label">What would you like to generate?</label>
          <div className="flex gap-3 mt-1">
            {[
              { key: 'brief',    label: 'Product Brief',      desc: 'For Sales & CS' },
              { key: 'playbook', label: 'Marketing Playbook', desc: 'Social copy & campaign' },
            ].map(({ key, label, desc }) => {
              const selected = collateral.includes(key);
              return (
                <label
                  key={key}
                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 flex-1 transition-all select-none ${
                    selected ? 'border-genea-bright bg-genea-light' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCollateral(key)}
                    className="w-4 h-4 mt-0.5 text-genea-bright rounded border-gray-300 focus:ring-genea-bright flex-shrink-0"
                  />
                  <div>
                    <p className={`font-semibold text-sm ${selected ? 'text-genea-navy' : 'text-gray-600'}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Paste Content ────────────────────────────────────────── */}
      <div className="genea-card">
        <h3 className="font-bold text-genea-navy text-base flex items-center gap-2 mb-3">
          <span className="w-6 h-6 bg-genea-navy rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
          Release Content
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Paste your Teams message, donkey.ai output, release notes, or any product update text. Claude will extract the summary, roadmap, audience info, and marketing angles.
        </p>

        <div
          ref={dropRef}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 rounded-xl transition-all ${
            dragging ? 'border-genea-bright bg-genea-light' : 'border-gray-200 bg-gray-50 hover:border-genea-bright/50'
          }`}
        >
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-genea-light/90 z-10 pointer-events-none">
              <p className="text-genea-blue font-semibold text-sm">Drop to paste</p>
            </div>
          )}
          <textarea
            value={rawText}
            onChange={e => { setRawText(e.target.value); if (state === 'error') setState('idle'); }}
            placeholder={`Paste your release notes or Teams message here...\n\nExample: "Camera Wall Setup and Timeline View is now available in the mobile app. Users can view live and recorded feeds alongside access events. Release date May 7, 2026..."`}
            rows={10}
            className="w-full p-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 rounded-xl focus:outline-none resize-none"
          />
        </div>
        {wordCount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5 text-right">{wordCount} words</p>
        )}
      </div>

      {/* ── Competitive Context ───────────────────────────────────── */}
      <div className="genea-card">
        <h3 className="font-bold text-genea-navy text-base flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-genea-navy rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
          Competitive Context
          <span className="text-xs font-normal text-gray-400 ml-1">optional</span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Select competitors to compare against. Mark whether they have this feature — this generates a competitive analysis table in the Product Brief.
        </p>
        <CompetitorSelector competitors={competitors} onChange={setCompetitors} />
      </div>

      {/* ── Playbook Brief ───────────────────────────────────────── */}
      {collateral.includes('playbook') && (
        <div className="genea-card space-y-4">
          <h3 className="font-bold text-genea-navy text-base flex items-center gap-2">
            <span className="w-6 h-6 bg-genea-bright rounded-full flex items-center justify-center text-white text-xs font-bold">5</span>
            Marketing Playbook Brief
            <span className="text-xs font-normal text-gray-400 ml-1">optional — guides Claude's copy</span>
          </h3>

          <div>
            <label className="genea-label">Key message / main angle</label>
            <textarea
              value={playbookBrief.keyMessage}
              onChange={e => setPlaybookBrief(b => ({ ...b, keyMessage: e.target.value }))}
              placeholder="e.g. We're first to market with hands-free UWB unlock — no other access control vendor offers this on Apple Watch."
              rows={2}
              className="genea-input text-sm resize-none"
            />
          </div>

          <div>
            <label className="genea-label">Proof points to include</label>
            <textarea
              value={playbookBrief.proofPoints}
              onChange={e => setPlaybookBrief(b => ({ ...b, proofPoints: e.target.value }))}
              placeholder="e.g. Zero friction at the door. Works on iPhone + Apple Watch. Anti-passback built in. Enterprise credential lifecycle management."
              rows={2}
              className="genea-input text-sm resize-none"
            />
          </div>

          <div>
            <label className="genea-label">Avoid / do not mention</label>
            <input
              type="text"
              value={playbookBrief.avoid}
              onChange={e => setPlaybookBrief(b => ({ ...b, avoid: e.target.value }))}
              placeholder="e.g. Don't mention NFC fallback limitations. Avoid direct competitor names."
              className="genea-input text-sm"
            />
          </div>

          <div>
            <label className="genea-label mb-2 block">Target Verticals
              <span className="text-gray-400 font-normal ml-1 text-xs">— Claude writes a tailored angle per vertical in each channel</span>
            </label>
            <VerticalSelector selected={targetVerticals} onChange={setTargetVerticals} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">Processing failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onManual}
          className="text-sm text-gray-400 hover:text-genea-navy transition-colors underline underline-offset-2"
        >
          Use step-by-step form instead
        </button>

        <button
          type="button"
          onClick={handleProcess}
          disabled={!canProcess || state === 'loading'}
          className={`flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-base transition-all shadow-md ${
            canProcess && state !== 'loading'
              ? 'bg-genea-navy text-white hover:bg-genea-blue hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {state === 'loading' ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing with Claude...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Release Materials
            </>
          )}
        </button>
      </div>
    </div>
  );
}
