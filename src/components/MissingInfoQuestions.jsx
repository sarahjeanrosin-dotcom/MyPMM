import { useState } from 'react';

export default function MissingInfoQuestions({ missingItems, onSubmit }) {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    missingItems.forEach(item => { init[item.field] = ''; });
    return init;
  });

  function handleChange(field, value) {
    setAnswers(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(answers);
  }

  const allAnswered = missingItems.every(item => answers[item.field]?.trim().length > 0);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-base">A few things are missing</h3>
          <p className="text-sm text-amber-700 mt-0.5">
            Answer these questions to generate richer, more complete documents. You can also skip and generate with what you have.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {missingItems.map(item => (
          <div key={item.field}>
            <label className="block text-sm font-semibold text-amber-900 mb-1.5">
              {item.question}
            </label>
            <textarea
              value={answers[item.field]}
              onChange={e => handleChange(item.field, e.target.value)}
              placeholder="Type your answer here..."
              rows={item.field === 'productInformation' ? 4 : 2}
              className="w-full border border-amber-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none transition-all"
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!allAnswered}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
              ${allAnswered
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                : 'bg-amber-200 text-amber-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Fill In Missing Info
          </button>
        </div>
      </form>
    </div>
  );
}
