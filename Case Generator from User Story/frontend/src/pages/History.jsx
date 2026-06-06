import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getHistoryItem, deleteHistoryItem } from '../services/api';
import { useToast } from '../hooks/useToast.jsx';
import LoadingSpinner from '../components/LoadingSpinner';

export default function History() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchHistory = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const data = await getHistory(query);
      setItems(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchHistory]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('History item deleted');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id) => {
    try {
      const data = await getHistoryItem(id);
      navigate('/generator', {
        state: {
          userStory: data.story,
          result: {
            id: data.id,
            positive: data.positive,
            negative: data.negative,
            edge: data.edge,
            gherkin: data.gherkin,
            totalScenarios: data.totalScenarios,
            coverageScore: data.coverageScore,
            confidence: data.confidence,
            expectedScenarios: data.expectedScenarios,
          },
        },
      });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const truncateStory = (story, max = 120) => {
    if (story.length <= max) return story;
    return story.slice(0, max) + '...';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Generation History
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage previously generated test cases
          </p>
        </div>

        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading history..." />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">No history yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search ? 'No results match your search.' : 'Generate test cases to see them here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card animate-slide-up transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {truncateStory(item.story)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(item.created_at)}</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      +{item.positive_count}
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      −{item.negative_count}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      ⚡{item.edge_count}
                    </span>
                    <span>{item.total_scenarios} scenarios</span>
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {Math.round(item.coverage_score)}% coverage
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button onClick={() => handleView(item.id)} className="btn-primary text-xs">
                    View Results
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="btn-secondary text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
