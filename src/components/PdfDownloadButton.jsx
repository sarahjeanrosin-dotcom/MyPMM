import { useState } from 'react';
import { generateProductBriefPdf, generateMarketingPlaybookPdf } from '../utils/pdfGenerator';
import { generateProductBriefDocx, generateMarketingPlaybookDocx } from '../utils/wordGenerator';
import { getLogoDataUrl } from '../utils/logoUtils';

export default function DownloadButton({ type, content, format = 'pdf' }) {
  const [state, setState] = useState('idle');

  const isWord = format === 'word';

  async function handleDownload() {
    setState('loading');
    try {
      if (isWord) {
        const logoDataUrl = await getLogoDataUrl('navy');
        const genFn = type === 'brief' ? generateProductBriefDocx : generateMarketingPlaybookDocx;
        const blob  = await genFn(content, logoDataUrl);
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href      = url;
        a.download  = type === 'brief' ? 'Genea-Product-Brief.docx' : 'Genea-Marketing-Playbook.docx';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const logoDataUrl = await getLogoDataUrl('white');
        const genFn = type === 'brief' ? generateProductBriefPdf : generateMarketingPlaybookPdf;
        const doc   = genFn(content, logoDataUrl);
        doc.save(type === 'brief' ? 'Genea-Product-Brief.pdf' : 'Genea-Marketing-Playbook.pdf');
      }
      setState('done');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error(err);
      setState('idle');
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={state === 'loading'}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all border ${
        state === 'done'
          ? 'bg-green-50 text-green-700 border-green-200'
          : isWord
          ? 'bg-white text-genea-navy border-genea-navy/30 hover:bg-genea-light hover:border-genea-navy'
          : 'bg-genea-navy text-white border-transparent hover:bg-genea-blue'
      } ${state === 'loading' ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {state === 'loading' ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : state === 'done' ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : isWord ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {state === 'done' ? 'Downloaded!' : isWord ? 'Download .docx' : 'Download PDF'}
    </button>
  );
}
