import { useState } from 'react';
import TierSelector from './TierSelector';
import FileUpload from './FileUpload';
import RoadmapTimeline from './RoadmapTimeline';
import CompetitorSelector from './CompetitorSelector';
import VerticalSelector from './VerticalSelector';
import { sampleRelease } from '../data/sampleData';
import { generateWhoWhatWhy } from '../utils/aiGenerator';

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
  { id: 1, label: 'Project Setup', icon: '⚙️' },
  { id: 2, label: 'Product Info', icon: '📋' },
  { id: 3, label: 'Roadmap', icon: '🗺️' },
  { id: 4, label: 'Users & Partners', icon: '👥' },
  { id: 5, label: 'Resources', icon: '🔗' },
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
          <TierSelector value={release.tierLevel} onChange={v => onChange({ tierLevel: v })} />
        </div>
      </FormField>

      <FormField label="Competitive Context" hint="Optional — select competitors and mark whether they have this feature.">
        <CompetitorSelector
          competitors={release.competitors || []}
          onChange={v => onChange({ competitors: v })}
        />
      </FormField>

      <FormField label="What would you like to generate?" required hint="Select at least one. Both are combined into a single downloadable document.">
        <div className="flex gap-3 mt-1">
          {[
            { key: 'brief',    label: 'Product Brief',       desc: 'For Sales & CS enablement' },
            { key: 'playbook', label: 'Marketing Playbook',  desc: 'Social copy & campaign guide' },
          ].map(({ key, label, desc }) => {
            const selected = (release.selectedCollateral || ['brief', 'playbook']).includes(key);
            return (
              <label
                key={key}
                className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 flex-1 transition-all select-none ${
                  selected ? 'border-genea-bright bg-genea-light' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={e => {
                    const current = release.selectedCollateral || ['brief', 'playbook'];
                    const updated = e.target.checked
                      ? [...current, key]
                      : current.filter(k => k !== key);
                    onChange({ selectedCollateral: updated });
                  }}
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
    if (currentStep === 1) return (
      release.productName && release.releaseDate && release.productSuite && release.tierLevel &&
      (release.selectedCollateral || []).length > 0
    );
    if (currentStep === 2) return release.productInformation && release.productInformation.length >= 50;
    return true;
  }

  const stepComponents = {
    1: <Step1 release={release} onChange={handleChange} />,
    2: <Step2 release={release} onChange={handleChange} />,
    3: <Step3 release={release} onChange={handleChange} />,
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
