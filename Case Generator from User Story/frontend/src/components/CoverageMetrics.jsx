export default function CoverageMetrics({ result }) {
  if (!result) return null;

  const metrics = [
    { label: 'Total Scenarios', value: result.totalScenarios, color: 'brand' },
    { label: 'Positive Cases', value: result.positive?.length || 0, color: 'green' },
    { label: 'Negative Cases', value: result.negative?.length || 0, color: 'red' },
    { label: 'Edge Cases', value: result.edge?.length || 0, color: 'amber' },
  ];

  const colorMap = {
    brand: 'bg-brand-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Coverage Score</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {result.totalScenarios} of {result.expectedScenarios} expected scenarios
            </p>
          </div>
          <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {result.coverageScore}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-1000 ease-out"
            style={{ width: `${result.coverageScore}%` }}
          />
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Confidence Score</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Model confidence in generated test cases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {result.confidence}%
          </span>
        </div>
      </div>

      {result.duplicatesRemoved > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {result.duplicatesRemoved} duplicate scenario(s) were automatically removed.
        </p>
      )}
    </div>
  );
}
