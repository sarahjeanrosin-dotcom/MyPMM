import { useState } from 'react';
import { GeneaLogoWhite } from './BrandTheme';
import { tierConfig } from '../config/tierConfig';

const channelColors = {
  LinkedIn: { bg: 'bg-[#0077B5]', light: 'bg-blue-50', border: 'border-[#0077B5]/30', text: 'text-[#0077B5]', badge: 'bg-[#0077B5]' },
  Instagram: { bg: 'bg-gradient-to-r from-purple-600 to-pink-500', light: 'bg-pink-50', border: 'border-pink-300/40', text: 'text-pink-600', badge: 'bg-gradient-to-r from-purple-600 to-pink-500' },
  YouTube: { bg: 'bg-red-600', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-600' },
};

const channelIcons = {
  LinkedIn: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  YouTube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
};

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
          rows={5}
          className={`w-full border border-genea-bright rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-genea-bright resize-none bg-white ${className}`}
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
        className={`w-full border border-genea-bright rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-genea-bright bg-white ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-pointer hover:bg-white/60 rounded px-1 -mx-1 transition-colors group inline-block ${className}`}
    >
      {value || <span className="text-gray-400 italic text-sm">{placeholder || 'Click to edit...'}</span>}
      <svg className="w-3 h-3 text-genea-bright opacity-0 group-hover:opacity-100 inline-block ml-1 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </span>
  );
}

const tierBadgeStyle = {
  'Tier 1': 'bg-red-500 text-white',
  'Tier 2': 'bg-genea-bright text-white',
  'Tier 3': 'bg-green-500 text-white',
  'Tier 4': 'bg-gray-500 text-white',
};

function FieldRow({ label, value, onChange, multiline = false, placeholder = '', boxStyle = '' }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-bold text-genea-navy uppercase tracking-widest">{label}</span>
      </div>
      <div className={`rounded-lg px-4 py-3 text-sm text-gray-700 ${boxStyle || 'bg-gray-50 border border-gray-200'}`}>
        <EditableField value={value} onChange={onChange} multiline={multiline} placeholder={placeholder} />
      </div>
    </div>
  );
}

function ChannelCard({ channelName, channelData, onChannelChange }) {
  const colors = channelColors[channelName] || channelColors.LinkedIn;

  function update(field, value) {
    onChannelChange({ ...channelData, [field]: value });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Channel Header */}
      <div className={`${colors.bg} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white">
            {channelIcons[channelName]}
          </div>
          <h3 className="text-white font-bold text-lg">{channelName}</h3>
        </div>
        <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Channel Playbook</span>
      </div>

      <div className="p-6">
        {/* Headline */}
        <div className="mb-4">
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Headline</p>
          <div className="bg-genea-light rounded-lg px-4 py-3">
            <p className={`font-bold text-base ${colors.text}`}>
              <EditableField value={channelData.headline} onChange={v => update('headline', v)} placeholder="Headline..." className="font-bold text-base" />
            </p>
          </div>
        </div>

        {/* Post Copy */}
        <div className="mb-4">
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Post Copy</p>
          <div className={`rounded-lg border-l-4 px-4 py-3 ${colors.light} ${colors.border}`} style={{ borderLeftColor: '' }}>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              <EditableField value={channelData.copy} onChange={v => update('copy', v)} multiline placeholder="Post copy..." />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CTA */}
          <div>
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Call to Action</p>
            <div className="bg-genea-navy/5 rounded-lg px-4 py-3 border border-genea-navy/10">
              <p className={`text-sm font-semibold ${colors.text}`}>
                <EditableField value={channelData.cta} onChange={v => update('cta', v)} placeholder="CTA text..." />
              </p>
            </div>
          </div>

          {/* Visual Direction */}
          <div>
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Visual Direction</p>
            <div className="bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <EditableField value={channelData.visualDirection} onChange={v => update('visualDirection', v)} multiline placeholder="Visual direction..." />
              </p>
            </div>
          </div>
        </div>

        {/* Audience Notes */}
        <div className="mt-4">
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Audience Notes</p>
          <div className="bg-green-50 rounded-lg px-4 py-3 border border-green-200">
            <p className="text-sm text-green-800">
              <EditableField value={channelData.audienceNotes} onChange={v => update('audienceNotes', v)} multiline placeholder="Audience notes..." />
            </p>
          </div>
        </div>

        {/* Vertical Angles */}
        {channelData.verticalAngles?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-2">Vertical Angles</p>
            <div className="space-y-2">
              {channelData.verticalAngles.map(({ vertical, angle }, i) => (
                <div key={vertical || i} className="bg-genea-light rounded-lg px-4 py-3 border border-genea-bright/25">
                  <p className="text-xs font-bold text-genea-navy mb-1">{vertical}</p>
                  <p className="text-sm text-gray-700">{angle}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailChannelCard({ data, onUpdate }) {
  function update(field, value) { onUpdate({ ...data, [field]: value }); }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-genea-navy px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 className="text-white font-bold text-lg">Email Copy</h3>
        </div>
        <span className="text-white/70 text-xs font-medium uppercase tracking-wider">General + Vertical</span>
      </div>

      <div className="p-6 space-y-4">
        {/* Subject */}
        <div>
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Subject Line</p>
          <div className="bg-genea-light rounded-lg px-4 py-3 border border-genea-bright/25">
            <p className="font-bold text-base text-genea-navy">
              <EditableField value={data.subject} onChange={v => update('subject', v)} placeholder="Email subject..." />
            </p>
          </div>
        </div>

        {/* Preheader */}
        {data.preheader && (
          <div>
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Preheader / Preview Text</p>
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                <EditableField value={data.preheader} onChange={v => update('preheader', v)} placeholder="Preview text..." />
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div>
          <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">Email Body</p>
          <div className="bg-gray-50 rounded-lg border-l-4 border-genea-navy px-4 py-3">
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              <EditableField value={data.body} onChange={v => update('body', v)} multiline placeholder="Email body..." />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[['cta1', 'CTA 1 — Demo'], ['cta2', 'CTA 2 — Learn More']].map(([field, label]) => (
            data[field] && (
              <div key={field}>
                <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1.5">{label}</p>
                <div className="bg-genea-navy/5 rounded-lg px-4 py-2.5 border border-genea-navy/10">
                  <p className="text-sm font-mono text-genea-blue font-semibold">
                    <EditableField value={data[field]} onChange={v => update(field, v)} placeholder="[CTA - LINK]" />
                  </p>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Vertical emails */}
        {data.verticalEmails?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-2">Verticalized Emails</p>
            <div className="space-y-3">
              {data.verticalEmails.map(({ vertical, subject, body, cta2 }, i) => (
                <details key={vertical || i} className="border border-genea-bright/30 rounded-xl bg-genea-light/50 overflow-hidden">
                  <summary className="px-4 py-2.5 cursor-pointer font-semibold text-sm text-genea-navy flex items-center justify-between list-none">
                    {vertical}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-genea-bright/20">
                    {subject && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Subject</p>
                        <p className="text-sm font-medium text-genea-navy">{subject}</p>
                      </div>
                    )}
                    {body && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Body</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{body}</p>
                      </div>
                    )}
                    {cta2 && (
                      <div className="bg-white rounded-lg px-3 py-2 border border-genea-bright/20">
                        <p className="text-xs font-mono text-genea-blue font-semibold">{cta2}</p>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketingPlaybookPreview({ content, onContentChange }) {
  function updateChannel(channelName, channelData) {
    onContentChange({
      ...content,
      channels: {
        ...content.channels,
        [channelName]: channelData,
      },
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Document Header */}
      <div className="bg-genea-navy px-8 py-5 flex items-center justify-between">
        <GeneaLogoWhite size="md" />
        <div className="text-right">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Marketing Playbook</p>
          <p className="text-white/60 text-xs mt-0.5">Confidential</p>
        </div>
      </div>
      <div className="h-1 bg-genea-bright" />

      <div className="p-8">
        {/* Title Block */}
        <div className="bg-genea-navy rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-genea-bright/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="text-2xl font-extrabold text-white leading-tight mb-3">
              {content.title?.replace('Marketing Playbook: ', '') || 'Marketing Playbook'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierBadgeStyle[content.tier] || 'bg-genea-bright text-white'}`}>
                {content.tier}
              </span>
              <span className="text-blue-300 text-xs">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tier context banner */}
        {(() => {
          const cfg = tierConfig[content.tier];
          if (!cfg) return null;
          const bannerStyle = {
            'Tier 1': 'bg-red-50 border-red-200 text-red-800',
            'Tier 2': 'bg-blue-50 border-blue-200 text-blue-800',
            'Tier 3': 'bg-green-50 border-green-200 text-green-800',
            'Tier 4': 'bg-gray-50 border-gray-200 text-gray-700',
          }[content.tier] || 'bg-gray-50 border-gray-200 text-gray-700';
          return (
            <div className={`rounded-xl border px-5 py-3 mb-6 text-sm ${bannerStyle}`}>
              <span className="font-semibold">{cfg.label}: </span>
              {cfg.description}
              {cfg.channels.length > 0 && (
                <span className="ml-2 font-medium">Channels: {cfg.channels.join(', ')}.</span>
              )}
            </div>
          );
        })()}

        {/* Tier 4 — no channels */}
        {(!content.channels || Object.keys(content.channels).length === 0) && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-700 text-lg mb-2">Release Notes Only</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Tier 4 releases don't require marketing materials. Log this update in the product release notes — no social campaign or customer email needed.
            </p>
          </div>
        )}

        {/* Channel Cards */}
        {content.channels && Object.entries(content.channels).map(([channelName, channelData]) => (
          channelName === 'Email'
            ? <EmailChannelCard key="Email" data={channelData} onUpdate={data => updateChannel('Email', data)} />
            : <ChannelCard key={channelName} channelName={channelName} channelData={channelData} onChannelChange={data => updateChannel(channelName, data)} />
        ))}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">© Genea Security — Confidential & Proprietary</p>
          <p className="text-xs text-gray-400">Marketing Playbook</p>
        </div>
      </div>
    </div>
  );
}
