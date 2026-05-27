import { useState } from 'react';
import { generateProductBriefPdf, generateMarketingPlaybookPdf } from '../utils/pdfGenerator';

export default function PdfDownloadButton({ type, content, label }) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      let doc;
      let filename;

      if (type === 'brief') {
        doc = generateProductBriefPdf(content);
        const name = content.title?.replace('Product Brief: ', '') || 'product';
        filename = `Genea_Product_Brief_${name.replace(/\s+/g, '_')}.pdf`;
      } else {
        doc = generateMarketingPlaybookPdf(content);
        const name = content.title?.replace('Marketing Playbook: ', '') || 'product';
        filename = `Genea_Marketing_Playbook_${name.replace(/\s+/g, '_')}.pdf`;
      }

      doc.save(filename);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const icons = {
    idle: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    loading: (
      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    downloaded: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  const state = loading ? 'loading' : downloaded ? 'downloaded' : 'idle';

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm
        ${downloaded
          ? 'bg-green-500 text-white'
          : loading
          ? 'bg-genea-navy/60 text-white cursor-not-allowed'
          : 'bg-genea-navy text-white hover:bg-genea-blue active:scale-95 hover:shadow-md'
        }
      `}
    >
      {icons[state]}
      <span>
        {downloaded ? 'Downloaded!' : loading ? 'Generating PDF...' : (label || 'Download PDF')}
      </span>
    </button>
  );
}
