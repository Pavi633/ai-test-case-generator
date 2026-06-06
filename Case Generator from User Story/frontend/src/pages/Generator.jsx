import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateTestCases } from '../services/api';
import { useToast } from '../hooks/useToast.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import CoverageMetrics from '../components/CoverageMetrics';
import ScenarioList from '../components/ScenarioList';
import GherkinViewer from '../components/GherkinViewer';
import {
  downloadFeatureFile,
  downloadJSON,
  downloadCSV,
  downloadPDF,
  copyToClipboard,
} from '../utils/exportUtils';

const PLACEHOLDER =
  'As a user, I want to login using email and password so that I can access my account.';

export default function Generator() {
  const location = useLocation();
  const initialData = location.state || null;

  const [userStory, setUserStory] = useState(initialData?.userStory || '');
  const [result, setResult] = useState(initialData?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (!userStory.trim()) {
      setError('Please enter a user story');
      addToast('Please enter a user story', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setWarning('');
    setResult(null);

    try {
      const data = await generateTestCases(userStory);
      setResult(data);
      if (data.warning) {
        setWarning(data.warning);
        addToast('Generated with local fallback (Ollama not running)', 'info');
      } else {
        addToast(`Generated ${data.totalScenarios} test scenarios successfully!`);
      }
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUserStory('');
    setResult(null);
    setError('');
    setWarning('');
  };

  const handleDownloadFeature = () => {
    if (!result?.gherkin) return;
    downloadFeatureFile(result.gherkin);
    addToast('Feature file downloaded!');
  };

  const handleCopyGherkin = async () => {
    if (!result?.gherkin) return;
    try {
      await copyToClipboard(result.gherkin);
      addToast('Gherkin copied to clipboard!');
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    downloadJSON(result);
    addToast('JSON exported!');
  };

  const handleExportCSV = () => {
    if (!result) return;
    downloadCSV(result);
    addToast('CSV exported!');
  };

  const handleExportPDF = () => {
    if (!result) return;
    downloadPDF(result, userStory);
    addToast('PDF report downloaded!');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Test Case Generator
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Paste your user story and let AI generate comprehensive test scenarios
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-4">
          <div className="card">
            <label htmlFor="userStory" className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
              User Story Input
            </label>
            <textarea
              id="userStory"
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={14}
              className="input-field resize-none font-mono text-sm leading-relaxed"
              disabled={loading}
            />

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {warning && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="font-semibold">Ollama not detected — using local fallback</p>
                <p className="mt-1">{warning}</p>
                <p className="mt-2 text-xs">
                  To enable AI generation: install from{' '}
                  <a href="https://ollama.com" className="underline" target="_blank" rel="noreferrer">
                    ollama.com
                  </a>
                  , then run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">ollama pull llama3</code>
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleGenerate} disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Test Cases
                  </>
                )}
              </button>
              <button onClick={handleClear} disabled={loading} className="btn-secondary">
                Clear
              </button>
              {result && (
                <button onClick={handleDownloadFeature} className="btn-secondary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Feature File
                </button>
              )}
            </div>
          </div>

          {result && (
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Export Options</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleCopyGherkin} className="btn-secondary text-xs">
                  Copy Gherkin
                </button>
                <button onClick={handleExportJSON} className="btn-secondary text-xs">
                  Export JSON
                </button>
                <button onClick={handleExportCSV} className="btn-secondary text-xs">
                  Export CSV
                </button>
                <button onClick={handleExportPDF} className="btn-secondary text-xs">
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-4">
          <div className="card min-h-[400px]">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Generated Test Cases
            </h2>

            {loading && <LoadingSpinner />}

            {!loading && !result && (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your generated test cases will appear here
                </p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-6">
                <CoverageMetrics result={result} />
                <ScenarioList result={result} />
                <GherkinViewer gherkin={result.gherkin} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
