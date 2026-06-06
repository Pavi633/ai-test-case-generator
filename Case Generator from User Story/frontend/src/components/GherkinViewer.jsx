import { highlightGherkin } from '../utils/gherkinHighlight';

export default function GherkinViewer({ gherkin }) {
  if (!gherkin) return null;

  return (
    <div className="card overflow-hidden">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        Gherkin Output
      </h3>
      <pre
        className="gherkin-highlight max-h-96 overflow-auto rounded-xl bg-gray-50 p-4 font-mono text-xs leading-relaxed dark:bg-gray-950"
        dangerouslySetInnerHTML={{ __html: highlightGherkin(gherkin) }}
      />
    </div>
  );
}
