import { useState } from 'react';
import RoadmapTimeline from './RoadmapTimeline';
import { GeneaLogoWhite } from './BrandTheme';
import { POSITION_STYLE } from './CompetitorSelector';

const FEATURE_STATUS = {
  yes:     { label: 'Has it',   color: 'text-red-600',   bg: 'bg-red-50',    dot: 'bg-red-400'   },
  no:      { label: "Doesn't",  color: 'text-green-600', bg: 'bg-green-50',  dot: 'bg-green-400' },
  unknown: { label: 'Unknown',  color: 'text-gray-400',  bg: 'bg-gray-50',   dot: 'bg-gray-300'  },
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

        {/* Competitive Context */}
        {content.competitiveContext?.competitors?.length > 0 && (() => {
          const { competitors, position } = content.competitiveContext;
          const pos = position ? POSITION_STYLE[position] : null;
          return (
            <div className="mb-6">
              <SectionHeader title="Competitive Context" color="bg-genea-blue" />
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-4">
                {pos && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-4 ${pos.bg} ${pos.text} ${pos.border}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {pos.label}
                  </div>
                )}
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 text-xs font-bold text-genea-navy uppercase tracking-wide border border-gray-200 w-1/2">Competitor</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-genea-navy uppercase tracking-wide border border-gray-200">Has This Feature?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map(({ name, hasFeature }) => {
                      const s = FEATURE_STATUS[hasFeature] || FEATURE_STATUS.unknown;
                      return (
                        <tr key={name} className="border-b border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-800 border border-gray-200">{name}</td>
                          <td className={`px-3 py-2 border border-gray-200 ${s.bg}`}>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.color}`}>
                              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

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

        {/* ── Demand Gen Brief ── */}
        {content.demandGen && (() => {
          const dg = content.demandGen;
          const hasAny = Object.values(dg).some(v =>
            typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.some(r => Object.values(r).some(x => x)) : false
          );
          if (!hasAny) return null;

          function dgUpdate(field, value) {
            update('demandGen.' + field, value);
          }

          function DgRow({ label, field, multiline }) {
            const val = dg[field];
            if (!val) return null;
            return (
              <div className="mb-3">
                <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1">{label}</p>
                <div className={`text-sm text-gray-700 leading-relaxed ${val === 'TBD' ? 'text-amber-600 font-semibold' : ''}`}>
                  <EditableField value={val} onChange={v => dgUpdate(field, v)} multiline={multiline} placeholder={label} />
                </div>
              </div>
            );
          }

          return (
            <div className="mt-6">
              <div className="bg-genea-bright px-4 py-2 rounded-t-lg">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Demand Gen Brief</h3>
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg p-5 space-y-5">

                {/* Launch Snapshot */}
                {(dg.segment || dg.primaryGoal || dg.creSubMotion) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Launch Snapshot</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[['Segment', 'segment'], ['CRE Sub-Motion', 'creSubMotion'], ['Primary Goal', 'primaryGoal'], ['Brief Locked By', 'briefLockedBy']].map(([label, field]) =>
                        dg[field] ? (
                          <div key={field} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                            <p className={`text-sm font-semibold ${dg[field] === 'TBD' ? 'text-amber-600' : 'text-genea-navy'}`}>{dg[field]}</p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* ICP & Audience */}
                {(dg.icpFirmographic || dg.qualifyingTriggers || dg.disqualifiers || dg.primaryPersonas || dg.secondaryPersonas || dg.painsJTBD) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">ICP & Audience</p>
                    <DgRow label="Ideal Customer Profile" field="icpFirmographic" multiline />
                    <DgRow label="Qualifying Triggers" field="qualifyingTriggers" multiline />
                    <DgRow label="Disqualifiers" field="disqualifiers" multiline />
                    <DgRow label="Primary Personas" field="primaryPersonas" multiline />
                    <DgRow label="Secondary Personas" field="secondaryPersonas" multiline />
                    <DgRow label="Pains / Jobs-to-be-Done" field="painsJTBD" multiline />
                  </div>
                )}

                {/* Use Cases */}
                {dg.useCases?.some(u => u.scenario) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Use Cases</p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {['Scenario', 'Persona', 'Trigger / Why Now'].map(h => (
                            <th key={h} className="text-left px-3 py-1.5 text-xs font-bold text-genea-navy uppercase tracking-wide border border-gray-200">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dg.useCases.filter(u => u.scenario).map((u, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-3 py-2 border border-gray-200 text-gray-800">{u.scenario}</td>
                            <td className="px-3 py-2 border border-gray-200 text-gray-700">{u.persona}</td>
                            <td className="px-3 py-2 border border-gray-200 text-gray-700">{u.trigger}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Positioning */}
                {(dg.valueProposition || dg.differentiation || dg.approvedCopyBlock || dg.bannedPhrasing || dg.messagingPillars?.some(p => p.pillar)) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Positioning & Messaging</p>
                    <DgRow label="Value Proposition" field="valueProposition" />
                    {dg.messagingPillars?.some(p => p.pillar) && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-genea-navy uppercase tracking-widest mb-1">Messaging Pillars</p>
                        <div className="space-y-1.5">
                          {dg.messagingPillars.filter(p => p.pillar).map((p, i) => (
                            <div key={i} className="bg-genea-light rounded-lg px-3 py-2 border border-genea-bright/20">
                              <span className="font-semibold text-genea-navy text-sm">{p.pillar}</span>
                              {p.proof && <span className="text-gray-500 text-sm"> — {p.proof}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <DgRow label="Differentiation" field="differentiation" />
                    <DgRow label="Approved Copy Block" field="approvedCopyBlock" multiline />
                    <DgRow label="Banned Phrasing" field="bannedPhrasing" />
                  </div>
                )}

                {/* Key Benefits */}
                {dg.keyBenefits?.some(b => b.feature) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Key Benefits</p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-1.5 text-xs font-bold text-genea-navy uppercase tracking-wide border border-gray-200 w-1/2">Feature / Capability</th>
                          <th className="text-left px-3 py-1.5 text-xs font-bold text-genea-navy uppercase tracking-wide border border-gray-200">Buyer Outcome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dg.keyBenefits.filter(b => b.feature).map((b, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-3 py-2 border border-gray-200 font-medium text-gray-800">{b.feature}</td>
                            <td className="px-3 py-2 border border-gray-200 text-gray-700">{b.outcome}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pricing */}
                {(dg.pricingTiers || dg.packagingBundle || dg.discountingGuidance || dg.competitivePricePosture) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Pricing & Packaging</p>
                    <DgRow label="Price Points / Tiers" field="pricingTiers" multiline />
                    <DgRow label="Packaging / Bundle" field="packagingBundle" multiline />
                    <DgRow label="Discounting / Deal Guidance" field="discountingGuidance" multiline />
                    <DgRow label="Competitive Price Posture" field="competitivePricePosture" />
                  </div>
                )}

                {/* Market */}
                {(dg.marketSizing || dg.bestOpportunity || dg.demandSignals || dg.marketTrends || dg.analystValidation) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Market & Opportunity</p>
                    <DgRow label="Market Sizing (TAM/SAM/SOM)" field="marketSizing" multiline />
                    <DgRow label="Best Opportunity" field="bestOpportunity" multiline />
                    <DgRow label="Demand & Intent Signals" field="demandSignals" multiline />
                    <DgRow label="Market Trends / Tailwinds" field="marketTrends" multiline />
                    <DgRow label="Analyst / Third-Party Validation" field="analystValidation" multiline />
                  </div>
                )}

                {/* Competitive */}
                {(dg.competitiveWedge || dg.topObjections) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Competitive</p>
                    <DgRow label="The Wedge" field="competitiveWedge" />
                    <DgRow label="Top Objections + Counters" field="topObjections" multiline />
                  </div>
                )}

                {/* Proof Points */}
                {(dg.statsAndBenchmarks || dg.customerNamesCleared || dg.roiTcoFigures || dg.quotesAndCaseStudies) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Proof Points & Evidence</p>
                    <DgRow label="Stats / Benchmarks" field="statsAndBenchmarks" multiline />
                    <DgRow label="Customer Names Cleared" field="customerNamesCleared" />
                    <DgRow label="ROI / TCO / NOI Figures" field="roiTcoFigures" multiline />
                    <DgRow label="Quotes & Case Studies" field="quotesAndCaseStudies" multiline />
                  </div>
                )}

                {/* Timeline */}
                {(dg.keyMilestones || dg.handoffSync) && (
                  <div>
                    <p className="text-xs font-bold text-genea-navy/50 uppercase tracking-widest mb-2">Timeline & SLA</p>
                    <DgRow label="Key Milestones" field="keyMilestones" multiline />
                    <DgRow label="Handoff Sync" field="handoffSync" />
                  </div>
                )}

              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">© Genea Security — Confidential</p>
          <p className="text-xs text-gray-400">Product Brief</p>
        </div>
      </div>
    </div>
  );
}
