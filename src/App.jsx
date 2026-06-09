import { useState, useEffect } from 'react';
import { defaultRelease } from './data/releaseModel';
import { sampleRelease } from './data/sampleData';
import { detectMissingInfo } from './utils/missingInfoDetector';
import { generateProductBriefContent, generateMarketingPlaybookContent } from './utils/contentGenerator';
import { generateMarketingCopy } from './utils/aiGenerator';
import { generateCombinedPdf } from './utils/pdfGenerator';
import { generateCombinedDocx } from './utils/wordGenerator';
import { getLogoDataUrl } from './utils/logoUtils';
import ReleaseIntakeForm from './components/ReleaseIntakeForm';
import RawInputScreen from './components/RawInputScreen';
import MissingInfoQuestions from './components/MissingInfoQuestions';
import ProductBriefPreview from './components/ProductBriefPreview';
import MarketingPlaybookPreview from './components/MarketingPlaybookPreview';
import { GeneaLogo, GeneaLogoWhite } from './components/BrandTheme';

const STORAGE_KEY = 'genea_pmm_release';
const VIEW_KEY = 'genea_pmm_view';

// ───────────────────────────────────────────────────────────────
// Shared top navbar
// ───────────────────────────────────────────────────────────────
function TopNav({ view, onStartOver }) {
  const showStartOver = view !== 'welcome';
  return (
    <nav className="bg-genea-navy shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <GeneaLogoWhite size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-blue-300 text-xs font-medium hidden sm:block">Release Document Builder</span>
            {showStartOver && (
              <button
                onClick={onStartOver}
                className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white border border-blue-700 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ───────────────────────────────────────────────────────────────
// Welcome Screen
// ───────────────────────────────────────────────────────────────
function WelcomeScreen({ onNew, onSample, hasSaved }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-genea-navy via-genea-blue to-genea-bright flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          {/* Hero icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <GeneaLogoWhite size="xl" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Release Document Builder
          </h1>
          <p className="text-xl text-blue-200 mb-12 leading-relaxed">
            Instantly generate a <strong className="text-white">Product Brief</strong> for Sales
            and a <strong className="text-white">Marketing Playbook</strong> from your release information.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['Product Brief PDF', 'Marketing Playbook PDF', 'LinkedIn Copy', 'Instagram Copy', 'YouTube Script', 'Roadmap Timeline'].map(f => (
              <span key={f} className="bg-white/10 text-white/90 text-sm px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNew}
              className="flex items-center gap-3 bg-white text-genea-navy px-8 py-4 rounded-2xl font-bold text-lg hover:bg-genea-light transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Start New Project
            </button>
            <button
              onClick={onSample}
              className="flex items-center gap-3 bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border border-white/30 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Load Sample Project
            </button>
          </div>

          {hasSaved && (
            <p className="text-blue-300/70 text-sm mt-6">
              You have a saved project. Click "Start New Project" to overwrite or continue.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-blue-400/60 text-xs">
        Genea Security — Internal Tool
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Review Screen
// ───────────────────────────────────────────────────────────────
function ReviewScreen({ release, onUpdate, onGenerate, onBack }) {
  const missingItems = detectMissingInfo(release);
  const criticalFields = ['productName', 'releaseDate', 'productSuite', 'productInformation'];
  const criticalMissing = missingItems.filter(m => criticalFields.includes(m.field));
  const canGenerate = criticalMissing.length === 0;

  function handleMissingAnswers(answers) {
    onUpdate({ ...release, ...answers });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-genea-navy mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Intake Form
        </button>

        <h2 className="text-2xl font-extrabold text-genea-navy">Review &amp; Generate</h2>
        <p className="text-gray-500 mt-1">Verify your information before generating documents.</p>
      </div>

      {/* Summary card */}
      <div className="genea-card mb-6">
        <h3 className="section-heading">Release Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Product</p>
            <p className="font-semibold text-gray-800">{release.productName || <span className="text-red-400 italic">Missing</span>}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Release Date</p>
            <p className="font-semibold text-gray-800">{release.releaseDate || <span className="text-red-400 italic">Missing</span>}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Product Suite</p>
            <p className="font-semibold text-gray-800">{release.productSuite || <span className="text-red-400 italic">Missing</span>}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Tier</p>
            <p className="font-semibold text-gray-800">{release.tierLevel}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Product Info</p>
            <p className="text-gray-700 line-clamp-3">{release.productInformation || <span className="text-red-400 italic">Missing</span>}</p>
          </div>
        </div>
      </div>

      {/* Missing info */}
      {missingItems.length > 0 && (
        <div className="mb-6">
          <MissingInfoQuestions missingItems={missingItems} onSubmit={handleMissingAnswers} />
        </div>
      )}

      {/* All good banner */}
      {missingItems.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">All set! Ready to generate your documents.</p>
            <p className="text-xs text-green-600 mt-0.5">All required fields are filled in.</p>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {canGenerate ? 'Documents will be editable after generation.' : 'Fill in missing required fields to continue.'}
        </p>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base transition-all shadow-md
            ${canGenerate
              ? 'bg-genea-navy text-white hover:bg-genea-blue hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Documents
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Documents View — tabbed, SaaS layout
// ───────────────────────────────────────────────────────────────
function DocumentsView({ release, briefContent, playbookContent, onBriefChange, onPlaybookChange, onBack }) {
  const hasBrief    = Boolean(briefContent);
  const hasPlaybook = Boolean(playbookContent);

  const tabs = [
    hasBrief    && { id: 'brief',    label: 'Product Brief',     dot: 'bg-genea-navy' },
    hasPlaybook && { id: 'playbook', label: 'Marketing Playbook', dot: 'bg-genea-bright' },
  ].filter(Boolean);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'brief');
  const [dlState, setDlState] = useState(null); // 'pdf' | 'word' | null

  async function handleDownload(format) {
    setDlState(format);
    try {
      if (format === 'pdf') {
        const logo = await getLogoDataUrl('white');
        const doc  = generateCombinedPdf(hasBrief ? briefContent : null, hasPlaybook ? playbookContent : null, logo);
        doc.save('Genea-Product-Release.pdf');
      } else {
        const logo = await getLogoDataUrl('navy');
        const blob = await generateCombinedDocx(hasBrief ? briefContent : null, hasPlaybook ? playbookContent : null, logo);
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'Genea-Product-Release.docx';
        a.click();
        URL.revokeObjectURL(url);
      }
      setTimeout(() => setDlState(null), 2000);
    } catch (err) {
      console.error(err);
      setDlState(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-genea-navy mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Edit Inputs
          </button>
          <h2 className="text-2xl font-extrabold text-genea-navy leading-tight">{release.productName}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {release.productSuite}{release.releaseDate ? `  ·  ${release.releaseDate}` : ''}
            {' '}· Click any field to edit before downloading.
          </p>
        </div>

        {/* Combined download buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {[
            { fmt: 'word', label: 'Download .docx', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { fmt: 'pdf',  label: 'Download PDF',  icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          ].map(({ fmt, label, icon }) => (
            <button
              key={fmt}
              onClick={() => handleDownload(fmt)}
              disabled={dlState !== null}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
                dlState === fmt
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : fmt === 'word'
                  ? 'bg-white text-genea-navy border-genea-navy/30 hover:bg-genea-light hover:border-genea-navy'
                  : 'bg-genea-navy text-white border-transparent hover:bg-genea-blue'
              } ${dlState !== null && dlState !== fmt ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {dlState === fmt ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              )}
              {dlState === fmt ? 'Downloaded!' : label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      {tabs.length > 1 && (
        <div className="flex border-b border-gray-200 mb-6 gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-genea-navy text-genea-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {(activeTab === 'brief' && hasBrief) && (
        <ProductBriefPreview content={briefContent} onContentChange={onBriefChange} />
      )}
      {(activeTab === 'playbook' && hasPlaybook) && (
        <MarketingPlaybookPreview content={playbookContent} onContentChange={onPlaybookChange} />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Main App
// ───────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || 'welcome';
    } catch {
      return 'welcome';
    }
  });

  const [release, setRelease] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...defaultRelease };
  });

  const [briefContent, setBriefContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.generatedProductBrief || null;
      }
    } catch {}
    return null;
  });

  const [playbookContent, setPlaybookContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.generatedMarketingPlaybook || null;
      }
    } catch {}
    return null;
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(release));
    } catch {}
  }, [release]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  function handleStartNew() {
    setRelease({ ...defaultRelease });
    setBriefContent(null);
    setPlaybookContent(null);
    setView('input');
  }

  function handleProcessed(populated) {
    setRelease(r => ({ ...defaultRelease, ...populated }));
    setBriefContent(null);
    setPlaybookContent(null);
    setView('review');
  }

  function handleLoadSample() {
    const sample = { ...sampleRelease };
    setRelease(sample);
    setBriefContent(null);
    setPlaybookContent(null);
    setView('intake');
  }

  function handleIntakeFinish() {
    setView('review');
  }

  async function handleGenerate() {
    setView('generating');
    try {
      const collateral = release.selectedCollateral || ['brief', 'playbook'];
      const wantsBrief    = collateral.includes('brief');
      const wantsPlaybook = collateral.includes('playbook');

      let releaseWithCopy = release;
      if (wantsPlaybook && !release.marketingCopy && release.tierLevel !== 'Tier 4') {
        const copy = await generateMarketingCopy(release);
        releaseWithCopy = { ...release, marketingCopy: copy };
        setRelease(releaseWithCopy);
      }
      const brief   = wantsBrief    ? generateProductBriefContent(releaseWithCopy)    : null;
      const playbook = wantsPlaybook ? generateMarketingPlaybookContent(releaseWithCopy) : null;
      setBriefContent(brief);
      setPlaybookContent(playbook);
      setRelease(r => ({ ...releaseWithCopy, generatedProductBrief: brief, generatedMarketingPlaybook: playbook }));
      setView('documents');
    } catch (err) {
      alert('Failed to generate marketing copy: ' + (err.message || 'Unknown error'));
      setView('review');
    }
  }

  function handleBriefChange(updated) {
    setBriefContent(updated);
    setRelease(r => ({ ...r, generatedProductBrief: updated }));
  }

  function handlePlaybookChange(updated) {
    setPlaybookContent(updated);
    setRelease(r => ({ ...r, generatedMarketingPlaybook: updated }));
  }

  function handleStartOver() {
    if (window.confirm('Start over? This will clear your current project.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VIEW_KEY);
      } catch {}
      setRelease({ ...defaultRelease });
      setBriefContent(null);
      setPlaybookContent(null);
      setView('welcome');
    }
  }

  const hasSaved = (() => {
    try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
  })();

  if (view === 'welcome') {
    return (
      <WelcomeScreen
        onNew={handleStartNew}
        onSample={handleLoadSample}
        hasSaved={hasSaved}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav view={view} onStartOver={handleStartOver} />

      <main className="flex-1">
        {view === 'input' && (
          <RawInputScreen
            onProcessed={handleProcessed}
            onManual={() => setView('intake')}
          />
        )}

        {view === 'intake' && (
          <div className="px-4 py-8">
            <ReleaseIntakeForm
              release={release}
              onChange={setRelease}
              onFinish={handleIntakeFinish}
            />
          </div>
        )}

        {view === 'generating' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <svg className="w-10 h-10 text-genea-bright animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-genea-navy font-semibold text-lg">Generating your documents...</p>
            <p className="text-gray-400 text-sm">Writing social copy for LinkedIn, Instagram, and YouTube</p>
          </div>
        )}

        {view === 'review' && (
          <ReviewScreen
            release={release}
            onUpdate={setRelease}
            onGenerate={handleGenerate}
            onBack={() => setView('intake')}
          />
        )}

        {view === 'documents' && (briefContent || playbookContent) && (
          <DocumentsView
            release={release}
            briefContent={briefContent}
            playbookContent={playbookContent}
            onBriefChange={handleBriefChange}
            onPlaybookChange={handlePlaybookChange}
            onBack={() => setView('review')}
          />
        )}

        {view === 'documents' && !briefContent && !playbookContent && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center">
            <p className="text-gray-500 mb-4">No documents generated yet.</p>
            <button
              onClick={() => setView('review')}
              className="genea-btn-primary"
            >
              Go to Review &amp; Generate
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
