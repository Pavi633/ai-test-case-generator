const severityColors = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const typeColors = {
  positive: 'border-green-200 dark:border-green-900/50',
  negative: 'border-red-200 dark:border-red-900/50',
  edge: 'border-amber-200 dark:border-amber-900/50',
};

function ScenarioCard({ scenario, type }) {
  return (
    <div className={`card border-l-4 ${typeColors[type] || ''} animate-slide-up`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{scenario.title}</h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[scenario.severity] || severityColors.Medium}`}
        >
          {scenario.severity}
        </span>
      </div>
      <ul className="space-y-1">
        {scenario.steps.map((step, i) => (
          <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScenarioList({ result }) {
  if (!result) return null;

  const sections = [
    { key: 'positive', label: 'Positive Test Cases', items: result.positive, type: 'positive' },
    { key: 'negative', label: 'Negative Test Cases', items: result.negative, type: 'negative' },
    { key: 'edge', label: 'Edge Cases', items: result.edge, type: 'edge' },
  ];

  return (
    <div className="space-y-6">
      {sections.map(
        (section) =>
          section.items?.length > 0 && (
            <div key={section.key}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                {section.label}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {section.items.length}
                </span>
              </h3>
              <div className="space-y-3">
                {section.items.map((scenario, i) => (
                  <ScenarioCard key={`${section.key}-${i}`} scenario={scenario} type={section.type} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
