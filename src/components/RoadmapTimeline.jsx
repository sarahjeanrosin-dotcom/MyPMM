import { useState, useRef } from 'react';
import { parseRoadmapText } from '../utils/roadmapParser';

const statusOptions = [
  { value: 'foundation', label: 'Foundation', color: 'bg-genea-navy text-white', dot: 'bg-genea-navy' },
  { value: 'current', label: 'Current', color: 'bg-genea-bright text-white', dot: 'bg-genea-bright' },
  { value: 'future', label: 'Future', color: 'bg-genea-light text-genea-navy border border-genea-bright', dot: 'border-2 border-genea-bright bg-white' },
];

function StatusBadge({ status }) {
  const opt = statusOptions.find(o => o.value === status) || statusOptions[0];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.color}`}>
      {opt.label}
    </span>
  );
}

// Paste & Parse tab
function PasteParser({ onApply }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [dragging, setDragging] = useState(false);
  const dropRef = useRef(null);

  function handleParse() {
    const result = parseRoadmapText(text);
    setParsed(result);
  }

  function handleApply() {
    onApply(parsed);
    setText('');
    setParsed(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    if (dropped) setText(dropped);
  }

  function updateParsed(idx, field, value) {
    setParsed(parsed.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  return (
    <div className="space-y-4">
      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragging ? 'border-genea-bright bg-genea-light' : 'border-gray-300 bg-gray-50'
        }`}
      >
        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-genea-light/80 z-10 pointer-events-none">
            <p className="text-genea-blue font-semibold text-sm">Drop text here</p>
          </div>
        )}
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setParsed(null); }}
          placeholder={`Paste or drop your roadmap text here. Any format works — bullet lists, paragraphs, tables.\n\nExample:\n• BLE Credential 2.0 — released Sept 2025, foundational tap-to-unlock\n• Mobile Credential 3.0 — current release, UWB hands-free unlock\n• Biometric Tap & Go — coming Q4 2026, FaceID + UWB combined`}
          rows={7}
          className="w-full p-4 bg-transparent text-sm text-gray-700 placeholder-gray-400 rounded-xl focus:outline-none focus:border-genea-bright resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          text.trim()
            ? 'bg-genea-navy text-white hover:bg-genea-blue shadow-sm hover:shadow-md'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Parse Roadmap
      </button>

      {parsed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-genea-navy">
              {parsed.length} item{parsed.length !== 1 ? 's' : ''} detected — review and apply
            </p>
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          </div>

          {parsed.map((item, idx) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <select
                  value={item.status}
                  onChange={e => updateParsed(idx, 'status', e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:border-genea-bright"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={item.title}
                onChange={e => updateParsed(idx, 'title', e.target.value)}
                className="w-full text-sm font-semibold border-b border-gray-100 pb-1 focus:outline-none focus:border-genea-bright text-gray-800"
                placeholder="Title"
              />
              <input
                type="text"
                value={item.description}
                onChange={e => updateParsed(idx, 'description', e.target.value)}
                className="w-full text-xs text-gray-500 border-b border-gray-100 pb-1 focus:outline-none focus:border-genea-bright"
                placeholder="Description"
              />
              <div className="flex gap-2 text-xs text-gray-400">
                {item.releaseDate && <span>{item.releaseDate}</span>}
                {item.featureNoteUrl && (
                  <a href={item.featureNoteUrl} target="_blank" rel="noopener noreferrer" className="text-genea-bright hover:underline truncate max-w-xs">
                    {item.featureNoteUrl}
                  </a>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleApply}
            className="w-full bg-genea-bright text-white py-2.5 rounded-xl font-bold text-sm hover:bg-genea-blue transition-colors shadow-md hover:shadow-lg"
          >
            Apply to Timeline
          </button>
        </div>
      )}
    </div>
  );
}

// Editor Mode: used in intake form
function RoadmapEditor({ items, onChange }) {
  const [tab, setTab] = useState('manual');

  function updateItem(id, field, value) {
    onChange(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  function addItem() {
    const newId = Math.max(0, ...items.map(i => i.id)) + 1;
    onChange([...items, {
      id: newId,
      title: '',
      description: '',
      status: 'future',
      releaseDate: '',
      featureNoteUrl: '',
      isReleased: false,
    }]);
  }

  function removeItem(id) {
    onChange(items.filter(item => item.id !== id));
  }

  function handleParsedApply(parsed) {
    onChange(parsed);
    setTab('manual');
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab('manual')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'manual' ? 'bg-white text-genea-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setTab('paste')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
            tab === 'paste' ? 'bg-white text-genea-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste & Parse
        </button>
      </div>

      {tab === 'paste' ? (
        <PasteParser onApply={handleParsedApply} />
      ) : (
        <>
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Item {idx + 1}</span>
                  <StatusBadge status={item.status} />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="genea-label text-xs">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateItem(item.id, 'title', e.target.value)}
                    placeholder="Feature name"
                    className="genea-input text-sm py-2"
                  />
                </div>
                <div>
                  <label className="genea-label text-xs">Status</label>
                  <select
                    value={item.status}
                    onChange={e => updateItem(item.id, 'status', e.target.value)}
                    className="genea-input text-sm py-2"
                  >
                    {statusOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="genea-label text-xs">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Brief description"
                    className="genea-input text-sm py-2"
                  />
                </div>
                <div>
                  <label className="genea-label text-xs">Release Date</label>
                  <input
                    type="text"
                    value={item.releaseDate}
                    onChange={e => updateItem(item.id, 'releaseDate', e.target.value)}
                    placeholder="e.g. 2026-06-15 or 2026-Q4"
                    className="genea-input text-sm py-2"
                  />
                </div>
                <div>
                  <label className="genea-label text-xs">Feature Note URL</label>
                  <input
                    type="url"
                    value={item.featureNoteUrl}
                    onChange={e => updateItem(item.id, 'featureNoteUrl', e.target.value)}
                    placeholder="https://help.getgenea.com/..."
                    className="genea-input text-sm py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isReleased}
                      onChange={e => updateItem(item.id, 'isReleased', e.target.checked)}
                      className="w-4 h-4 text-genea-bright rounded border-gray-300 focus:ring-genea-bright"
                    />
                    <span className="text-sm font-medium text-gray-700">Already Released</span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full border-2 border-dashed border-genea-blue text-genea-blue py-3 rounded-xl font-semibold text-sm hover:bg-genea-light transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Roadmap Item
          </button>
        </>
      )}
    </div>
  );
}

// Preview Mode: SVG timeline that always fits its container
function RoadmapPreview({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-400 text-sm italic">No roadmap items added.</p>;
  }

  const displayItems = items.slice(0, 8);
  const n = displayItems.length;

  const W = 600;
  const H = 170;
  const PAD_L = 12;
  const PAD_R = 90; // extra right room for last item's angled label
  const usableW = W - PAD_L - PAD_R;
  const LINE_Y = 50;

  const dotX = (i) => n === 1 ? PAD_L + usableW / 2 : PAD_L + (i / (n - 1)) * usableW;

  return (
    <div className="py-4 px-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
        {/* Timeline line */}
        <line x1={PAD_L} y1={LINE_Y} x2={PAD_L + usableW} y2={LINE_Y} stroke="#e2e8f0" strokeWidth="2.5" />

        {displayItems.map((item, idx) => {
          const x = dotX(idx);
          const isCur = item.status === 'current';
          const isFnd = item.status === 'foundation';
          const label = item.title
            ? (item.title.length > 16 ? item.title.slice(0, 14) + '…' : item.title)
            : '—';

          return (
            <g key={item.id}>
              {/* Date above dot */}
              {item.releaseDate && (
                <text x={x} y={LINE_Y - 10} textAnchor="middle" fontSize="7" fill="#94a3b8">
                  {item.releaseDate}
                </text>
              )}

              {/* Dot */}
              {isCur ? (
                <>
                  <circle cx={x} cy={LINE_Y} r="9" fill="#2196f3" fillOpacity="0.12" />
                  <circle cx={x} cy={LINE_Y} r="6" fill="#2196f3" />
                  <circle cx={x} cy={LINE_Y} r="2.5" fill="white" />
                </>
              ) : isFnd ? (
                <circle cx={x} cy={LINE_Y} r="5" fill="#003865" />
              ) : (
                <circle cx={x} cy={LINE_Y} r="5" fill="white" stroke="#2196f3" strokeWidth="1.5" strokeDasharray="3 2" />
              )}

              {/* Title — 40° clockwise from just below the dot */}
              <text
                x={x - 2}
                y={LINE_Y + 12}
                fontSize="8.5"
                fill={isCur ? '#2196f3' : isFnd ? '#003865' : '#94a3b8'}
                fontWeight={isCur ? 'bold' : 'normal'}
                transform={`rotate(40, ${x - 2}, ${LINE_Y + 12})`}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${PAD_L}, ${H - 16})`}>
          <circle cx="5" cy="4" r="4" fill="#003865" />
          <text x="12" y="7.5" fontSize="7.5" fill="#64748b">Foundation</text>
          <circle cx="64" cy="4" r="4" fill="#2196f3" />
          <text x="71" y="7.5" fontSize="7.5" fill="#64748b">Current</text>
          <circle cx="111" cy="4" r="4" fill="white" stroke="#2196f3" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="118" y="7.5" fontSize="7.5" fill="#64748b">Upcoming</text>
        </g>
      </svg>
    </div>
  );
}

export default function RoadmapTimeline({ mode = 'editor', items = [], onChange }) {
  if (mode === 'preview') {
    return <RoadmapPreview items={items} />;
  }
  return <RoadmapEditor items={items} onChange={onChange} />;
}
