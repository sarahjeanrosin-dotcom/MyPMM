export const GENEA_VERTICALS = [
  'Healthcare',
  'CRE (Commercial Real Estate)',
  'K-12 Education',
  'Higher Education',
  'Finance',
  'Critical Infrastructure',
];

export default function VerticalSelector({ selected = [], onChange }) {
  function toggle(v) {
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {GENEA_VERTICALS.map(v => {
        const on = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              on
                ? 'bg-genea-bright text-white border-genea-bright shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-genea-bright hover:text-genea-bright'
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
