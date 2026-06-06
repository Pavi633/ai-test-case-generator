export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              AI Test Case Generator
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Open-source · Ollama · Cucumber & Behave compatible
            </p>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Case Generator from User Story
          </p>
        </div>
      </div>
    </footer>
  );
}
