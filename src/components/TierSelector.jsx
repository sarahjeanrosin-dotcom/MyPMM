import { tierConfig } from '../config/tierConfig';

const tierColors = {
  'Tier 1': 'border-red-500 bg-red-50',
  'Tier 2': 'border-genea-bright bg-genea-light',
  'Tier 3': 'border-green-500 bg-green-50',
  'Tier 4': 'border-gray-400 bg-gray-50',
};

const tierBadgeColors = {
  'Tier 1': 'bg-red-500 text-white',
  'Tier 2': 'bg-genea-bright text-white',
  'Tier 3': 'bg-green-500 text-white',
  'Tier 4': 'bg-gray-400 text-white',
};

const tierSelectedRing = {
  'Tier 1': 'ring-2 ring-red-500',
  'Tier 2': 'ring-2 ring-genea-bright',
  'Tier 3': 'ring-2 ring-green-500',
  'Tier 4': 'ring-2 ring-gray-400',
};

export default function TierSelector({ value, onChange }) {
  return (
    <div>
      <label className="genea-label">Release Tier</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(tierConfig).map(([tier, config]) => {
          const isSelected = value === tier;
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onChange(tier)}
              className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${isSelected ? `${tierColors[tier]} ${tierSelectedRing[tier]}` : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${isSelected ? tierBadgeColors[tier] : 'bg-gray-200 text-gray-600'}`}>
                  {tier}
                </span>
                {isSelected && (
                  <span className="text-genea-bright">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-800 mt-1">{config.label.split('—')[1]?.trim()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
