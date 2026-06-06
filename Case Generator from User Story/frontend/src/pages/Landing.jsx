import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Positive Case Generation',
    description: 'Automatically create happy-path scenarios that validate core functionality.',
    icon: '✓',
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Negative Case Generation',
    description: 'Cover invalid inputs, error handling, and failure scenarios comprehensively.',
    icon: '✕',
    color: 'from-red-500 to-rose-600',
  },
  {
    title: 'Edge Case Generation',
    description: 'Identify boundary conditions, security cases, and unusual inputs.',
    icon: '⚡',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Gherkin Output',
    description: 'Get Given-When-Then formatted scenarios ready for BDD frameworks.',
    icon: '📝',
    color: 'from-brand-500 to-indigo-600',
  },
  {
    title: 'Feature File Export',
    description: 'Download .feature files compatible with Cucumber and Behave.',
    icon: '📥',
    color: 'from-purple-500 to-violet-600',
  },
];

export default function Landing() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              Powered by Ollama · 100% Local & Free
            </span>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              AI Test Case{' '}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Transform user stories into comprehensive test cases instantly. Generate positive,
              negative, and edge scenarios in Gherkin format — ready for Cucumber and Behave.
            </p>
            <p className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400">
              Generate Test Cases with AI
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/generator" className="btn-primary px-8 py-4 text-base">
                Start Generating
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/history" className="btn-secondary px-8 py-4 text-base">
                View History
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything You Need</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            A complete QA workflow from user story to executable test scenarios
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-xl text-white shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-br from-brand-600 to-purple-700 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to automate your test case writing?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Paste a user story, click generate, and get production-ready Gherkin scenarios in seconds.
          </p>
          <Link
            to="/generator"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
