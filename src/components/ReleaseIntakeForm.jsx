import { useState } from 'react';
import TierSelector from './TierSelector';
import FileUpload from './FileUpload';
import RoadmapTimeline from './RoadmapTimeline';
import CompetitorSelector from './CompetitorSelector';
import VerticalSelector from './VerticalSelector';
import CollateralSelector from './CollateralSelector';
import { tierConfig } from '../config/tierConfig';
import { sampleRelease } from '../data/sampleData';
import { generateWhoWhatWhy, generateDgSuggestion } from '../utils/aiGenerator';

const CURRENT_YEAR = new Date().getFullYear();
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const YEARS = [CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];

function DateField({ value, onChange }) {
  const isWindow = /^Q[1-4]-\d{4}$/.test(value || '');
  const [mode, setMode] = useState(isWindow ? 'window' : 'specific');
  const [q, setQ]   = useState(() => { const m = (value||'').match(/^(Q[1-4])/); return m ? m[1] : 'Q3'; });
  const [yr, setYr] = useState(() => { const m = (value||'').match(/(\d{4})$/);  return m ? m[1] : String(CURRENT_YEAR + 1); });

  function setWindow(newQ, newYr) { onChange(`${newQ}-${newYr}`); }

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit mb-2">
        {[{id:'specific',label:'Exact date'},{id:'window',label:'Quarter'}].map(({id,label}) => (
          <button key={id} type="button"
            onClick={() => { setMode(id); if (id==='window') setWindow(q,yr); else onChange(''); }}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${mode===id?'bg-white text-genea-navy shadow-sm':'text-gray-400 hover:text-gray-600'}`}
          >{label}</button>
        ))}
      </div>
      {mode === 'specific' ? (
        <input type="date" value={value && !/^Q/.test(value) ? value : ''} onChange={e => onChange(e.target.value)} className="genea-input" />
      ) : (
        <div className="flex gap-2">
          <select value={q} onChange={e => { setQ(e.target.value); setWindow(e.target.value, yr); }} className="genea-input flex-1">
            {QUARTERS.map(qtr => <option key={qtr}>{qtr}</option>)}
          </select>
          <select value={yr} onChange={e => { setYr(e.target.value); setWindow(q, e.target.value); }} className="genea-input flex-1">
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { id: 1,  label: 'Project Setup',      icon: '⚙️' },
  { id: 2,  label: 'Product Info',       icon: '📋' },
  { id: 3,  label: 'Roadmap',            icon: '🗺️' },
  { id: 4,  label: 'Users & Partners',   icon: '👥' },
  { id: 5,  label: 'Resources',          icon: '🔗' },
  { id: 6,  label: 'ICP & Audience',     icon: '🎯' },
  { id: 7,  label: 'Positioning',        icon: '💬' },
  { id: 8,  label: 'Pricing & Market',   icon: '📈' },
  { id: 9,  label: 'Proof & Timeline',   icon: '✅' },
];

function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-genea-bright transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map(step => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${isCompleted
                  ? 'bg-genea-bright text-white shadow-md shadow-genea-bright/30'
                  : isCurrent
                  ? 'bg-genea-navy text-white shadow-lg shadow-genea-navy/30 ring-4 ring-genea-navy/20'
                  : 'bg-white text-gray-400 border-2 border-gray-200'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-genea-navy' : isCompleted ? 'text-genea-bright' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormField({ label, children, hint, required }) {
  return (
    <div>
      <label className="genea-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

// Step 1: Project Setup
function Step1({ release, onChange }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Product / Feature Name" required>
          <input
            type="text"
            value={release.productName}
            onChange={e => onChange({ productName: e.target.value })}
            placeholder="e.g. Genea Mobile Credential 3.0"
            className="genea-input"
          />
        </FormField>
        <FormField label="Release Date / Expected Release Date" required>
          <DateField value={release.releaseDate || ''} onChange={v => onChange({ releaseDate: v })} />
        </FormField>
      </div>

      <FormField label="Product Suite" required hint="e.g. Genea Access Control, Genea Visitor Management">
        <input
          type="text"
          value={release.productSuite}
          onChange={e => onChange({ productSuite: e.target.value })}
          placeholder="e.g. Genea Access Control"
          className="genea-input"
        />
      </FormField>

      <FormField label="Related Releases" hint="Other products or versions being released alongside this one">
        <input
          type="text"
          value={release.relatedReleases}
          onChange={e => onChange({ relatedReleases: e.target.value })}
          placeholder="e.g. Genea Access Control 5.2, Visitor Management 2.1"
          className="genea-input"
        />
      </FormField>

      <FormField label="Release Tier" required>
        <div className="mt-1">
          <TierSelector
            value={release.tierLevel}
            onChange={v => onChange({
              tierLevel: v,
              selectedCollateral: tierConfig[v]?.collateralDefaults || [],
            })}
          />
        </div>
      </FormField>

      <FormField label="Competitive Context" hint="Optional — select competitors and mark whether they have this feature.">
        <CompetitorSelector
          competitors={release.competitors || []}
          onChange={v => onChange({ competitors: v })}
        />
      </FormField>

      <FormField label="What would you like to generate?" required hint="Defaults are set by tier. Combined into one downloadable document.">
        <CollateralSelector
          selected={release.selectedCollateral || []}
          tierLevel={release.tierLevel}
          onChange={v => onChange({ selectedCollateral: v })}
        />
      </FormField>

      {(release.selectedCollateral || []).includes('playbook') && (
        <>
          <FormField
            label="Marketing Playbook Brief"
            hint="Optional — Claude uses these as writing instructions for the social copy."
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Key message / main angle</label>
                <textarea
                  value={release.playbookBrief?.keyMessage || ''}
                  onChange={e => onChange({ playbookBrief: { ...release.playbookBrief, keyMessage: e.target.value } })}
                  placeholder="e.g. We're first to market with hands-free UWB unlock..."
                  rows={2}
                  className="genea-input text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Proof points to include</label>
                <textarea
                  value={release.playbookBrief?.proofPoints || ''}
                  onChange={e => onChange({ playbookBrief: { ...release.playbookBrief, proofPoints: e.target.value } })}
                  placeholder="e.g. Zero friction, Apple Watch support, enterprise-grade anti-passback..."
                  rows={2}
                  className="genea-input text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Avoid / do not mention</label>
                <input
                  type="text"
                  value={release.playbookBrief?.avoid || ''}
                  onChange={e => onChange({ playbookBrief: { ...release.playbookBrief, avoid: e.target.value } })}
                  placeholder="e.g. Don't mention NFC fallback limitations..."
                  className="genea-input text-sm"
                />
              </div>
            </div>
          </FormField>

          <FormField label="Target Verticals" hint="Claude writes a tailored one-liner per vertical in each channel section.">
            <VerticalSelector
              selected={release.targetVerticals || []}
              onChange={v => onChange({ targetVerticals: v })}
            />
          </FormField>
        </>
      )}
    </div>
  );
}

// Step 2: Product Information
function Step2({ release, onChange }) {
  return (
    <div className="space-y-5">
      <FormField
        label="Product Information"
        required
        hint="Describe what this release includes, what's new, and key capabilities. Be thorough — this drives both documents."
      >
        <textarea
          value={release.productInformation}
          onChange={e => onChange({ productInformation: e.target.value })}
          placeholder="Describe the product or feature in detail. What does it do? What's new? What are the key capabilities? Who is it for?"
          rows={8}
          className="genea-input resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${release.productInformation.length < 50 ? 'text-amber-500' : 'text-green-500'}`}>
            {release.productInformation.length} chars {release.productInformation.length < 50 ? '(need at least 50)' : '✓'}
          </span>
        </div>
      </FormField>

      <FileUpload
        files={release.uploadedFiles}
        onChange={files => onChange({ uploadedFiles: files })}
      />
    </div>
  );
}

// Step 3: Roadmap
function Step3({ release, onChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-genea-light rounded-xl p-4 border border-genea-bright/30">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-genea-bright flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-genea-navy">Roadmap Timeline</p>
            <p className="text-xs text-genea-blue mt-0.5">
              Add foundation (past), current, and future items. These will appear as a visual timeline in the Product Brief.
            </p>
          </div>
        </div>
      </div>

      <RoadmapTimeline
        mode="editor"
        items={release.roadmapItems}
        onChange={items => onChange({ roadmapItems: items })}
      />
    </div>
  );
}

// Step 4: End Users & Partners
function Step4({ release, onChange }) {
  const [aiState, setAiState] = useState('idle'); // idle | loading | error
  const [aiError, setAiError] = useState('');

  async function handleGenerateAI() {
    if (!release.productInformation || release.productInformation.length < 50) {
      setAiError('Add more product information (step 2) before generating.');
      return;
    }
    setAiState('loading');
    setAiError('');
    try {
      const result = await generateWhoWhatWhy(release);
      onChange({
        endUserWhat: result.endUser.what,
        endUserWho: result.endUser.who,
        endUserWhy: result.endUser.why,
        partnerWhat: result.partner.what,
        partnerWho: result.partner.who,
        partnerWhy: result.partner.why,
      });
      setAiState('idle');
    } catch (err) {
      setAiError(err.message || 'AI generation failed. Check your API key in .env.local.');
      setAiState('error');
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Generate button */}
      <div className="bg-genea-light rounded-xl p-4 border border-genea-bright/30 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-genea-navy">Generate with AI</p>
          <p className="text-xs text-genea-blue mt-0.5">
            Use Claude to draft all six WHO/WHAT/WHY fields from your product information.
          </p>
          {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
        </div>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={aiState === 'loading'}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            aiState === 'loading'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-genea-navy text-white hover:bg-genea-blue hover:shadow-md'
          }`}
        >
          {aiState === 'loading' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate
            </>
          )}
        </button>
      </div>

      {/* End Users */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-genea-navy rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-genea-navy">End Users</h3>
        </div>

        <div className="space-y-4">
          <FormField label="WHAT — What is this feature from the end user perspective?" required>
            <textarea
              value={release.endUserWhat}
              onChange={e => onChange({ endUserWhat: e.target.value })}
              placeholder="Describe what this feature does for the end user"
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
          <FormField label="WHO — Who is the primary end user?" required>
            <textarea
              value={release.endUserWho}
              onChange={e => onChange({ endUserWho: e.target.value })}
              placeholder="Describe the primary end user"
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
          <FormField label="WHY — Why does this matter to the end user?" required>
            <textarea
              value={release.endUserWhy}
              onChange={e => onChange({ endUserWhy: e.target.value })}
              placeholder="Explain the user value / pain point solved"
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-genea-blue rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-genea-navy">Integrators & Partners</h3>
        </div>

        <div className="space-y-4">
          <FormField label="WHAT — What does this mean for integrators and partners?" required>
            <textarea
              value={release.partnerWhat}
              onChange={e => onChange({ partnerWhat: e.target.value })}
              placeholder="Describe what this means for partners technically and commercially"
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
          <FormField label="WHO — Who are the target partners?">
            <textarea
              value={release.partnerWho}
              onChange={e => onChange({ partnerWho: e.target.value })}
              placeholder="e.g. Physical security integrators, MDM providers..."
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
          <FormField label="WHY — Why should partners care?">
            <textarea
              value={release.partnerWhy}
              onChange={e => onChange({ partnerWhy: e.target.value })}
              placeholder="Business case for partners"
              rows={2}
              className="genea-input resize-none"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Step 5: Additional Resources
function Step5({ release, onChange }) {
  return (
    <div className="space-y-5">
      <div className="bg-genea-light rounded-xl p-4 border border-genea-bright/30">
        <p className="text-sm text-genea-navy">
          <strong>Add links, articles, and notes</strong> that are relevant to this release. These will appear in the Product Brief's Additional Resources section.
        </p>
      </div>

      <FormField label="Help Center Article URL" hint="Primary help center article for this release">
        <input
          type="url"
          value={release.helpCenterUrl}
          onChange={e => onChange({ helpCenterUrl: e.target.value })}
          placeholder="https://help.getgenea.com/..."
          className="genea-input"
        />
      </FormField>

      <FormField
        label="Additional Resources"
        hint="Release notes, product videos, support docs — one per line. URLs will be clickable in the PDF."
      >
        <textarea
          value={release.additionalResources}
          onChange={e => onChange({ additionalResources: e.target.value })}
          placeholder={`Release Notes: https://getgenea.com/release-notes/...\nProduct Video: https://youtube.com/...`}
          rows={6}
          className="genea-input resize-none font-mono text-sm"
        />
      </FormField>

      <div className="border-t border-gray-200 pt-5">
        <FormField
          label="Launch Context"
          hint="Notes, strategy, stakeholder context, or anything else Claude should know when generating content. This is not published — it only informs the AI."
        >
          <textarea
            value={release.launchContext || ''}
            onChange={e => onChange({ launchContext: e.target.value })}
            placeholder={`e.g. We're announcing this at the trade show on June 15th. Sales team needs enablement by June 1st. Key stakeholder: John Smith (VP Sales). Our main competitor Openpath doesn't have this feature yet. Avoid mentioning pricing changes in any copy.`}
            rows={6}
            className="genea-input resize-none"
          />
        </FormField>
      </div>
    </div>
  );
}

// ── TBD / N/A / AI helpers ───────────────────────────────────────
function StatusBadge({ value, target, label, activeClass, onChange }) {
  const isActive = value === target;
  return (
    <button
      type="button"
      onClick={() => onChange(isActive ? '' : target)}
      className={`text-xs font-semibold px-2 py-0.5 rounded border transition-all ${
        isActive ? activeClass : 'text-gray-300 border-gray-200 hover:text-gray-500 hover:border-gray-400'
      }`}
    >
      {isActive ? `${label} ×` : label}
    </button>
  );
}

function DgField({ label, hint, value, onChange, multiline = false, placeholder = '', onSuggest }) {
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState(null);
  const isTbd = value === 'TBD';
  const isNa  = value === 'N/A';
  const isSpecial = isTbd || isNa;

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      const suggestion = await onSuggest();
      if (suggestion) onChange(typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion));
    } catch (e) {
      setError('AI suggest failed — try again.');
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="genea-label mb-0">{label}</label>
        <div className="flex items-center gap-1.5">
          {onSuggest && (
            <button
              type="button"
              onClick={handleSuggest}
              disabled={suggesting || isSpecial}
              className={`text-xs font-semibold px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                suggesting || isSpecial
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-genea-bright border-genea-bright/40 hover:bg-genea-light hover:border-genea-bright'
              }`}
            >
              {suggesting ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '✨'} AI
            </button>
          )}
          <StatusBadge value={value} target="TBD" label="TBD" activeClass="bg-amber-50 text-amber-700 border-amber-300" onChange={onChange} />
          <StatusBadge value={value} target="N/A" label="N/A" activeClass="bg-gray-100 text-gray-500 border-gray-400" onChange={onChange} />
        </div>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      {isSpecial ? (
        <div className={`genea-input text-sm font-semibold ${isTbd ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
          {isTbd ? 'TBD' : 'N/A'}
        </div>
      ) : multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="genea-input resize-none"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="genea-input"
        />
      )}
    </div>
  );
}

// Step 6: ICP & Audience
function Step6({ release, onChange }) {
  const SEGMENTS   = ['Security end-user', 'CRE', 'Both', 'TBD'];
  const CRE_SUBS   = ['Submeter Billing', 'On-Demand HVAC', 'Security + VM', 'TBD', 'N/A'];
  const GOALS      = ['Pipeline $', 'Awareness', 'Expansion', 'TBD'];
  const suggest = (field) => () => generateDgSuggestion(field, release);

  return (
    <div className="space-y-5">
      {/* Launch Snapshot additions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Segment" required>
          <select value={release.segment || 'TBD'} onChange={e => onChange({ segment: e.target.value })} className="genea-input">
            {SEGMENTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="CRE Sub-Motion">
          <select value={release.creSubMotion || 'N/A'} onChange={e => onChange({ creSubMotion: e.target.value })} className="genea-input">
            {CRE_SUBS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Primary Goal" required>
          <select value={release.primaryGoal || 'TBD'} onChange={e => onChange({ primaryGoal: e.target.value })} className="genea-input">
            {GOALS.map(g => <option key={g}>{g}</option>)}
          </select>
        </FormField>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">ICP & Personas</p>
        <DgField
          label="Ideal Customer Profile (Firmographic)"
          hint="Company type, size, vertical, geography. For CRE: Class A office, building SF, REIT vs owner-operator. For Security: multi-site, healthcare, higher ed."
          value={release.icpFirmographic || ''}
          onChange={v => onChange({ icpFirmographic: v })}
          onSuggest={suggest('icpFirmographic')}
          multiline
          placeholder="e.g. Multi-site enterprise, 500+ employees, healthcare or higher ed verticals, North America..."
        />
        <DgField
          label="Qualifying Triggers / Buying Signals"
          hint="What makes an account in-market now."
          value={release.qualifyingTriggers || ''}
          onChange={v => onChange({ qualifyingTriggers: v })}
          onSuggest={suggest('qualifyingTriggers')}
          multiline
          placeholder="e.g. Lease event, migration off on-prem, expansion, refresh cycle..."
        />
        <DgField
          label="Disqualifiers / Exclusions"
          hint="Who this is NOT for. Prevents wasted spend."
          value={release.disqualifiers || ''}
          onChange={v => onChange({ disqualifiers: v })}
          onSuggest={suggest('disqualifiers')}
          multiline
          placeholder="e.g. Single-site SMB, residential, non-enterprise..."
        />
        <DgField
          label="Primary Persona(s) and Titles"
          value={release.primaryPersonas || ''}
          onChange={v => onChange({ primaryPersonas: v })}
          onSuggest={suggest('primaryPersonas')}
          multiline
          placeholder="e.g. Director of Physical Security, VP of Real Estate, IT Manager..."
        />
        <DgField
          label="Secondary / Influencer Personas"
          value={release.secondaryPersonas || ''}
          onChange={v => onChange({ secondaryPersonas: v })}
          onSuggest={suggest('secondaryPersonas')}
          multiline
          placeholder="e.g. CIO, Facilities Manager, Building Owner..."
        />
        <DgField
          label="Pains / Jobs-to-be-Done per Persona"
          value={release.painsJTBD || ''}
          onChange={v => onChange({ painsJTBD: v })}
          onSuggest={suggest('painsJTBD')}
          multiline
          placeholder="e.g. Security Director: needs centralized visibility across sites without rip-and-replace..."
        />
      </div>
    </div>
  );
}

// Step 7: Use Cases & Positioning
function Step7({ release, onChange }) {
  const [pillarsSuggesting, setPillarsSuggesting] = useState(false);
  const [pillarsError, setPillarsError] = useState(null);
  const suggest = (field) => () => generateDgSuggestion(field, release);

  function updateUseCase(i, field, val) {
    const updated = (release.useCases || []).map((uc, idx) => idx === i ? { ...uc, [field]: val } : uc);
    onChange({ useCases: updated });
  }
  function addUseCase() {
    onChange({ useCases: [...(release.useCases || []), { scenario: '', persona: '', trigger: '' }] });
  }
  function removeUseCase(i) {
    onChange({ useCases: (release.useCases || []).filter((_, idx) => idx !== i) });
  }
  function updatePillar(i, field, val) {
    const pillars = (release.messagingPillars || [{},{},{}]).map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    onChange({ messagingPillars: pillars });
  }
  async function suggestPillars() {
    setPillarsSuggesting(true);
    setPillarsError(null);
    try {
      const result = await generateDgSuggestion('messagingPillars', release);
      if (Array.isArray(result)) onChange({ messagingPillars: result });
    } catch {
      setPillarsError('AI suggest failed — try again.');
    } finally {
      setPillarsSuggesting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Use Cases */}
      <div>
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-3">Use Cases</p>
        <div className="space-y-2">
          {(release.useCases || [{ scenario: '', persona: '', trigger: '' }]).map((uc, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-start">
              <input value={uc.scenario} onChange={e => updateUseCase(i, 'scenario', e.target.value)} placeholder="Scenario / use case" className="genea-input text-sm" />
              <input value={uc.persona}  onChange={e => updateUseCase(i, 'persona',  e.target.value)} placeholder="Persona" className="genea-input text-sm" />
              <div className="flex gap-1">
                <input value={uc.trigger} onChange={e => updateUseCase(i, 'trigger', e.target.value)} placeholder="Trigger / why now" className="genea-input text-sm flex-1" />
                {i > 0 && <button type="button" onClick={() => removeUseCase(i)} className="text-red-400 hover:text-red-600 px-1 text-lg leading-none">×</button>}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addUseCase} className="mt-2 text-xs text-genea-bright font-semibold hover:text-genea-blue">+ Add use case</button>
      </div>

      {/* Positioning */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Positioning & Messaging</p>
        <DgField label="One-line Value Proposition" value={release.valueProposition || ''} onChange={v => onChange({ valueProposition: v })} onSuggest={suggest('valueProposition')} placeholder="e.g. The only enterprise-grade hands-free access platform with native Apple Watch support." />
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="genea-label mb-0">Messaging Pillars</p>
            <button
              type="button"
              onClick={suggestPillars}
              disabled={pillarsSuggesting}
              className={`text-xs font-semibold px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                pillarsSuggesting
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-genea-bright border-genea-bright/40 hover:bg-genea-light hover:border-genea-bright'
              }`}
            >
              {pillarsSuggesting ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : '✨'} AI Generate All
            </button>
          </div>
          {pillarsError && <p className="text-xs text-red-500 mb-1">{pillarsError}</p>}
          {[0, 1, 2].map(i => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <input
                value={release.messagingPillars?.[i]?.pillar || ''}
                onChange={e => updatePillar(i, 'pillar', e.target.value)}
                placeholder={`Pillar ${i + 1}`}
                className="genea-input text-sm"
              />
              <input
                value={release.messagingPillars?.[i]?.proof || ''}
                onChange={e => updatePillar(i, 'proof', e.target.value)}
                placeholder="Proof point"
                className="genea-input text-sm"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">Left: pillar statement · Right: supporting proof point</p>
        </div>
        <DgField label="One-sentence Differentiation" value={release.differentiation || ''} onChange={v => onChange({ differentiation: v })} onSuggest={suggest('differentiation')} placeholder="e.g. Unlike Openpath, Genea delivers hands-free UWB unlock without proprietary hardware lock-in." />
        <DgField label="Approved Copy Block" hint="Pre-cleared short paragraph demand gen can paste into a newsletter or ad unit." value={release.approvedCopyBlock || ''} onChange={v => onChange({ approvedCopyBlock: v })} multiline placeholder="Drop-in approved paragraph..." />
        <DgField label="Banned / Off-message Phrasing" value={release.bannedPhrasing || ''} onChange={v => onChange({ bannedPhrasing: v })} placeholder="e.g. Don't mention NFC limitations, avoid 'revolutionary'..." />
      </div>
    </div>
  );
}

// Step 8: Benefits, Pricing & Market
function Step8({ release, onChange }) {
  const POSTURES = ['Premium', 'Parity', 'Value', 'TBD'];
  const [benefitsSuggesting, setBenefitsSuggesting] = useState(false);
  const [benefitsError, setBenefitsError] = useState(null);

  function updateBenefit(i, field, val) {
    const updated = (release.keyBenefits || []).map((b, idx) => idx === i ? { ...b, [field]: val } : b);
    onChange({ keyBenefits: updated });
  }
  function addBenefit() {
    onChange({ keyBenefits: [...(release.keyBenefits || []), { feature: '', outcome: '' }] });
  }
  function removeBenefit(i) {
    onChange({ keyBenefits: (release.keyBenefits || []).filter((_, idx) => idx !== i) });
  }
  async function suggestBenefits() {
    setBenefitsSuggesting(true);
    setBenefitsError(null);
    try {
      const result = await generateDgSuggestion('keyBenefits', release);
      if (Array.isArray(result)) onChange({ keyBenefits: result });
    } catch {
      setBenefitsError('AI suggest failed — try again.');
    } finally {
      setBenefitsSuggesting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Key Benefits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Key Benefits & Features</p>
          <button
            type="button"
            onClick={suggestBenefits}
            disabled={benefitsSuggesting}
            className={`text-xs font-semibold px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
              benefitsSuggesting
                ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                : 'text-genea-bright border-genea-bright/40 hover:bg-genea-light hover:border-genea-bright'
            }`}
          >
            {benefitsSuggesting ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : '✨'} AI Generate All
          </button>
        </div>
        {benefitsError && <p className="text-xs text-red-500 mb-2">{benefitsError}</p>}
        <div className="grid grid-cols-2 gap-2 mb-1">
          <p className="text-xs text-gray-400 font-semibold">Feature / capability</p>
          <p className="text-xs text-gray-400 font-semibold">Buyer outcome (the so-what)</p>
        </div>
        <div className="space-y-2">
          {(release.keyBenefits || [{ feature: '', outcome: '' }]).map((b, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 items-center">
              <input value={b.feature} onChange={e => updateBenefit(i, 'feature', e.target.value)} placeholder="e.g. UWB hands-free unlock" className="genea-input text-sm" />
              <div className="flex gap-1">
                <input value={b.outcome} onChange={e => updateBenefit(i, 'outcome', e.target.value)} placeholder="e.g. Zero friction at every door" className="genea-input text-sm flex-1" />
                {i > 0 && <button type="button" onClick={() => removeBenefit(i)} className="text-red-400 hover:text-red-600 px-1 text-lg leading-none">×</button>}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addBenefit} className="mt-2 text-xs text-genea-bright font-semibold hover:text-genea-blue">+ Add benefit</button>
      </div>

      {/* Pricing */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Pricing & Packaging</p>
        <DgField label="Price Points / Tiers" hint="Actual numbers or ranges, and the unit (per door, per building, per user)." value={release.pricingTiers || ''} onChange={v => onChange({ pricingTiers: v })} multiline placeholder="e.g. $X per door/month, enterprise volume pricing available..." />
        <DgField label="Packaging / Bundle" value={release.packagingBundle || ''} onChange={v => onChange({ packagingBundle: v })} multiline placeholder="e.g. Standalone add-on, included in Enterprise tier..." />
        <DgField label="Discounting / Deal Guidance" value={release.discountingGuidance || ''} onChange={v => onChange({ discountingGuidance: v })} multiline placeholder="e.g. Standard 15% for multi-year, 20% for 50+ doors..." />
        <FormField label="Competitive Price Posture">
          <select value={release.competitivePricePosture || 'TBD'} onChange={e => onChange({ competitivePricePosture: e.target.value })} className="genea-input">
            {POSTURES.map(p => <option key={p}>{p}</option>)}
          </select>
        </FormField>
      </div>

      {/* Market */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Market & Opportunity</p>
        <DgField label="Market Sizing (TAM / SAM / SOM)" hint="By segment. Size the one this launch targets." value={release.marketSizing || ''} onChange={v => onChange({ marketSizing: v })} multiline placeholder="e.g. TAM: $X B global enterprise access, SAM: $X B US multi-site..." />
        <DgField label="Best Opportunity / Where to Focus" hint="The highest-yield slice: segment, vertical, account tier, or named ABM list." value={release.bestOpportunity || ''} onChange={v => onChange({ bestOpportunity: v })} multiline placeholder="e.g. Healthcare and higher ed, 500+ employees, migrating off legacy..." />
        <DgField label="Demand & Intent Signals" hint="G2 buyer intent, search trends, event signals, category momentum." value={release.demandSignals || ''} onChange={v => onChange({ demandSignals: v })} multiline placeholder="e.g. ~25-30 hot accounts/week on G2, rising searches for 'hands-free access'..." />
        <DgField label="Market Trends / Tailwinds" value={release.marketTrends || ''} onChange={v => onChange({ marketTrends: v })} multiline placeholder="e.g. Cloud migration off on-prem, return-to-office driving access upgrades..." />
        <DgField label="Analyst / Third-Party Validation" value={release.analystValidation || ''} onChange={v => onChange({ analystValidation: v })} multiline placeholder="e.g. Gartner names access control as fastest-growing physical security category..." />
      </div>
    </div>
  );
}

// Step 9: Competitive, Proof Points & Timeline
function Step9({ release, onChange }) {
  const suggest = (field) => () => generateDgSuggestion(field, release);
  return (
    <div className="space-y-5">
      {/* Competitive */}
      <div>
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-3">Competitive</p>
        <div className="space-y-4">
          <DgField label="The Wedge (what we win on)" value={release.competitiveWedge || ''} onChange={v => onChange({ competitiveWedge: v })} onSuggest={suggest('competitiveWedge')} placeholder="e.g. Open API, no hardware lock-in, cloud-native architecture..." />
          <DgField label="Top Objections + Counters" value={release.topObjections || ''} onChange={v => onChange({ topObjections: v })} onSuggest={suggest('topObjections')} multiline placeholder="Objection: [x] → Counter: [y]&#10;Objection: [x] → Counter: [y]" />
        </div>
      </div>

      {/* Proof Points */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Proof Points & Evidence</p>
        <DgField label="Stats / Benchmarks" value={release.statsAndBenchmarks || ''} onChange={v => onChange({ statsAndBenchmarks: v })} multiline placeholder="e.g. 99.9% uptime, 40% faster credential provisioning vs legacy..." />
        <DgField label="Customer Names Cleared for Use" value={release.customerNamesCleared || ''} onChange={v => onChange({ customerNamesCleared: v })} placeholder="e.g. Healthpeak Properties, UCLA, Boston Properties..." />
        <DgField label="ROI / TCO / NOI Figures + Methodology" value={release.roiTcoFigures || ''} onChange={v => onChange({ roiTcoFigures: v })} multiline placeholder="e.g. Average 30% reduction in access-related support tickets..." />
        <DgField label="Quotes, Case Studies, Analyst Mentions" value={release.quotesAndCaseStudies || ''} onChange={v => onChange({ quotesAndCaseStudies: v })} multiline placeholder="e.g. 'Genea cut our provisioning time in half' — IT Director, Healthpeak..." />
      </div>

      {/* Timeline */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest">Timeline & SLA</p>
        <DgField label="Key Milestones" hint="Beta, press, GA, event tie-in dates." value={release.keyMilestones || ''} onChange={v => onChange({ keyMilestones: v })} multiline placeholder="e.g. Beta: May 15 · Press embargo lift: June 10 · GA: June 15 · RSA event: June 20..." />
        <DgField label="Handoff Sync Date" hint="Date for live walkthrough with demand gen team." value={release.handoffSync || ''} onChange={v => onChange({ handoffSync: v })} placeholder="e.g. June 1, 2026" />
      </div>
    </div>
  );
}

export default function ReleaseIntakeForm({ release, onChange, onFinish }) {
  const [currentStep, setCurrentStep] = useState(1);

  function handleChange(updates) {
    onChange({ ...release, ...updates });
  }

  function loadSampleData() {
    onChange({ ...sampleRelease });
  }

  function canProceed() {
    if (currentStep === 1) return !!(release.productName && release.releaseDate && release.productSuite && release.tierLevel);
    if (currentStep === 2) return release.productInformation && release.productInformation.length >= 50;
    return true;
  }

  const stepComponents = {
    1: <Step1 release={release} onChange={handleChange} />,
    2: <Step2 release={release} onChange={handleChange} />,
    3: <Step3 release={release} onChange={handleChange} />,
    6: <Step6 release={release} onChange={handleChange} />,
    7: <Step7 release={release} onChange={handleChange} />,
    8: <Step8 release={release} onChange={handleChange} />,
    9: <Step9 release={release} onChange={handleChange} />,
    4: <Step4 release={release} onChange={handleChange} />,
    5: <Step5 release={release} onChange={handleChange} />,
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-genea-navy">Release Information</h2>
          <p className="text-sm text-gray-500 mt-0.5">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}</p>
        </div>
        <button
          type="button"
          onClick={loadSampleData}
          className="flex items-center gap-2 text-sm font-semibold text-genea-bright hover:text-genea-blue border border-genea-bright/40 hover:border-genea-blue px-4 py-2 rounded-lg hover:bg-genea-light transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Load Sample Data
        </button>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

      {/* Form Card */}
      <div className="genea-card mb-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <span className="text-xl">{STEPS[currentStep - 1].icon}</span>
          <h3 className="font-bold text-gray-800 text-lg">{STEPS[currentStep - 1].label}</h3>
        </div>

        {stepComponents[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(s => s - 1)}
          disabled={currentStep === 1}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
            ${currentStep === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-genea-navy hover:bg-genea-light'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep(s => s + 1)}
            disabled={!canProceed()}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm
              ${canProceed()
                ? 'bg-genea-navy text-white hover:bg-genea-blue hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-genea-bright text-white hover:bg-genea-blue transition-all shadow-md hover:shadow-lg"
          >
            Review & Generate
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
