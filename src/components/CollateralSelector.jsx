import { tierConfig, COLLATERAL_ITEMS } from '../config/tierConfig';

const GROUPS = [
  { key: 'document', label: 'Document' },
  { key: 'social',   label: 'Social Channels' },
  { key: 'email',    label: 'Email' },
];

export default function CollateralSelector({ selected = [], tierLevel, onChange }) {
  function toggle(key) {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  }

  function applyTierDefaults() {
    const defaults = tierConfig[tierLevel]?.collateralDefaults || [];
    onChange(defaults);
  }

  return (
    <div className="space-y-3">
      {GROUPS.map(group => {
        const items = COLLATERAL_ITEMS.filter(i => i.group === group.key);
        return (
          <div key={group.key}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {items.map(({ key, label, desc }) => {
                const on = selected.includes(key);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all select-none ${
                      on ? 'border-genea-bright bg-genea-light' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(key)}
                      className="w-3.5 h-3.5 text-genea-bright rounded border-gray-300 focus:ring-genea-bright flex-shrink-0"
                    />
                    <div>
                      <p className={`text-sm font-semibold leading-none ${on ? 'text-genea-navy' : 'text-gray-600'}`}>{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {tierLevel && (
        <button
          type="button"
          onClick={applyTierDefaults}
          className="text-xs text-genea-bright hover:text-genea-blue underline underline-offset-2 transition-colors"
        >
          Reset to {tierLevel} defaults
        </button>
      )}
    </div>
  );
}
