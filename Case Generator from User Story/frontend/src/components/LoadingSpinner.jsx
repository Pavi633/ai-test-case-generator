export default function LoadingSpinner({ message = 'Generating test cases with AI...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-900" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-600" />
      </div>
      <p className="animate-pulse text-sm font-medium text-gray-600 dark:text-gray-400">{message}</p>
      <p className="text-xs text-gray-400">Analyzing user story via Ollama LLM...</p>
    </div>
  );
}
