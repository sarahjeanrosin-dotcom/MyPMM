import { useState } from 'react';
import RoadmapTimeline from './RoadmapTimeline';
import { GeneaLogoWhite } from './BrandTheme';

function EditableField({ value, onChange, multiline = false, placeholder = '', className = '' }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder={placeholder}
          rows={4}
          className={`w-full border border-genea-bright rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-genea-bright resize-none ${className}`}
        />
      );
    }
    return (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        placeholder={placeholder}
        className={`w-full border border-genea-bright rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-genea-bright ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-pointer hover:bg-genea-light/60 rounded px-1 -mx-1 transition-colors group inline-block ${className}`}
    >
      {value || <span className="text-gray-400 italic">{placeholder || 'Click to edit...'}</span>}
      <svg className="w-3 h-3 text-genea-bright opacity-0 group-hover:opacity-100 inline-block ml-1 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </span>
  );
}

function SectionHeader({ title, color = 'bg-genea-navy' }) {
  return (
    <div className={`${color} px-4 py-2 rounded-t-lg`}>
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function WWWBlock({ label, value, onChange, color = 'genea-navy' }) {
  return (
    <div className="mb-3">
      <div className="bg-genea-light px-3 py-1.5 rounded-t border-t border-l border-r border-genea-bright/30">
        <span className={`text-xs font-bold text-${color} uppercase tracking-widest`}>{label}</span>
      </div>
      <div className="bg-white px-3 py-2.5 rounded-b border border-genea-bright/20 text-sm text-gray-700">
        <EditableField value={value} onChange={onChange} multiline placeholder={`Enter ${label.toLowerCase()}...`} />
      </div>
    </div>
  );
}

export default function ProductBriefPreview({ content, onContentChange }) {
  function update(path, value) {
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(content));
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onContentChange(updated);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Document Header */}
      <div className="bg-genea-navy px-8 py-5 flex items-center justify-between">
        <GeneaLogoWhite size="md" />
        <div className="text-right">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Product Brief</p>
          <p className="text-white/60 text-xs mt-0.5">Confidential</p>
        </div>
      </div>
      <div className="h-1 bg-genea-bright" />

      <div className="p-8">
        {/* Title Block */}
        <div className="bg-genea-light rounded-xl p-6 mb-6 border border-genea-bright/30">
          <h1 className="text-2xl font-extrabold text-genea-navy leading-tight mb-2">
            <EditableField
              value={content.title?.replace('Product Brief: ', '') || ''}
              onChange={v => update('title', `Product Brief: ${v}`)}
              placeholder="Product Name"
              className="text-2xl font-extrabold"
            />
          </h1>
          <p className="text-sm text-genea-blue font-medium">
            Product Suite: <EditableField value={content.productSuite} onChange={v => update('productSuite', v)} placeholder="Product Suite" />
          </p>
        </div>

        {/* Meta Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Release Date</p>
            <p className="text-sm text-gray-800 font-medium">
              <EditableField value={content.releaseDate} onChange={v => update('releaseDate', v)} placeholder="Release date" />
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Related Releases</p>
            <p className="text-sm text-gray-800">
              <EditableField value={content.relatedReleases} onChange={v => update('relatedReleases', v)} placeholder="Related releases..." />
            </p>
          </div>
        </div>

        {/* Product Summary */}
        <div className="mb-6">
          <SectionHeader title="Product Summary" />
          <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              <EditableField value={content.summary} onChange={v => update('summary', v)} multiline placeholder="Product summary..." />
            </p>
          </div>
        </div>

        {/* Roadmap */}
        <div className="mb-6">
          <SectionHeader title="Product Roadmap" />
          <div className="border border-t-0 border-gray-200 rounded-b-lg">
            <RoadmapTimeline mode="preview" items={content.roadmapItems} />
          </div>
        </div>

        {/* End Users */}
        <div className="mb-6">
          <SectionHeader title="End Users" />
          <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
            <WWWBlock label="WHAT" value={content.endUser?.what} onChange={v => update('endUser.what', v)} />
            <WWWBlock label="WHO" value={content.endUser?.who} onChange={v => update('endUser.who', v)} />
            <WWWBlock label="WHY" value={content.endUser?.why} onChange={v => update('endUser.why', v)} />
          </div>
        </div>

        {/* Integrators & Partners */}
        <div className="mb-6">
          <SectionHeader title="Integrators & Partners" color="bg-genea-blue" />
          <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
            <WWWBlock label="WHAT" value={content.partner?.what} onChange={v => update('partner.what', v)} color="genea-blue" />
            <WWWBlock label="WHO" value={content.partner?.who} onChange={v => update('partner.who', v)} color="genea-blue" />
            <WWWBlock label="WHY" value={content.partner?.why} onChange={v => update('partner.why', v)} color="genea-blue" />
          </div>
        </div>

        {/* Additional Resources */}
        {(content.additionalResources) && (
          <div className="mb-6">
            <SectionHeader title="Additional Resources" color="bg-slate-600" />
            <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
              <pre className="text-sm text-genea-blue whitespace-pre-wrap font-sans">
                <EditableField value={content.additionalResources} onChange={v => update('additionalResources', v)} multiline placeholder="Add resource links..." />
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">© Genea Security — Confidential</p>
          <p className="text-xs text-gray-400">Product Brief</p>
        </div>
      </div>
    </div>
  );
}
