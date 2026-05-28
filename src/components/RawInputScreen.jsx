import { useState, useRef } from 'react';
import TierSelector from './TierSelector';
import { processRawRelease } from '../utils/aiGenerator';

export default function RawInputScreen({ onProcessed, onManual }) {
  const [rawText, setRawText] = useState('');
  const [tierLevel, setTierLevel] = useState('Tier 2');
  const [state, setState] = useState('idle'); // idle | loading | error
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef(null);

  async function handleProcess() {
    if (!rawText.trim()) return;
    setState('loading');
    setError('');
    try {
      const result = await processRawRelease(rawText, tierLevel);
      onProcessed({ ...result, tierLevel, uploadedFiles: [], marketingCopy: result.marketingCopy || null });
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

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const canProcess = rawText.trim().length > 20;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-genea-navy">New Release Project</h2>
        <p className="text-gray-500 mt-1">
          Paste your Teams message, donkey.ai output, or any product update text. Claude will extract and generate everything.
        </p>
      </div>

      {/* Paste zone */}
      <div className="genea-card mb-6">
        <label className="genea-label mb-2 block">Paste your release content</label>

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
              <div className="text-center">
                <svg className="w-8 h-8 text-genea-bright mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-genea-blue font-semibold text-sm">Drop to paste</p>
              </div>
            </div>
          )}
          <textarea
            value={rawText}
            onChange={e => { setRawText(e.target.value); if (state === 'error') setState('idle'); }}
            placeholder={`Paste your Teams message or donkey.ai output here.\n\nExample:\n"Camera Wall Setup and Timeline View is now available in the mobile app. This feature allows users to view live and recorded camera feeds alongside access events in a unified timeline. Release date is May 7, 2026. Related to the Camera Wall desktop release and Arculeus Native API integration..."`}
            rows={12}
            className="w-full p-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 rounded-xl focus:outline-none resize-none"
          />
        </div>

        {wordCount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5 text-right">{wordCount} words</p>
        )}
      </div>

      {/* Tier selector */}
      <div className="genea-card mb-6">
        <label className="genea-label mb-3 block">Release Tier</label>
        <TierSelector value={tierLevel} onChange={setTierLevel} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
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
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onManual}
          className="text-sm text-gray-400 hover:text-genea-navy transition-colors underline underline-offset-2"
        >
          Enter manually instead
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
              Process with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
