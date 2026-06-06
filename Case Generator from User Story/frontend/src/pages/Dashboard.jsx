import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getDashboardRecent, getHistoryItem } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function truncate(text, max = 100) {
  if (!text || text.length <= max) return text;
  return text.slice(0, max) + '…';
}

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, title, value, description, gradient }) {
  return (
    <div className="card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 transition-all duration-300 group-hover:opacity-20`}
      />
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
}

// ─── Pie Chart colours ────────────────────────────────────────────────────────

const PIE_COLORS = {
  Positive: '#22c55e',
  Negative: '#ef4444',
  Edge: '#f59e0b',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <span className="font-semibold text-gray-900 dark:text-white">{name}:</span>{' '}
      <span className="text-gray-600 dark:text-gray-300">{value} cases</span>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color = 'from-brand-500 to-brand-400', label }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const now = useLiveClock();

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingId, setViewingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, recentData] = await Promise.all([
        getDashboardStats(),
        getDashboardRecent(),
      ]);
      setStats(statsData);
      setRecent(recentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewResult = async (id) => {
    setViewingId(id);
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
      console.error('View result error:', err.message);
    } finally {
      setViewingId(null);
    }
  };

  // ── Derived data for charts ────────────────────────────────────────────────

  const pieData = stats
    ? [
        { name: 'Positive', value: stats.totalPositive },
        { name: 'Negative', value: stats.totalNegative },
        { name: 'Edge', value: stats.totalEdge },
      ].filter((d) => d.value > 0)
    : [];

  const hasAnyData = stats && stats.totalStories > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner message="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-8 sm:px-6 lg:px-8">

      {/* ── SECTION 1 · Welcome Header ────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              {user?.username}
            </span>{' '}
            👋
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate and manage AI-powered test cases from user stories.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Date &amp; Time</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="font-mono text-xs text-brand-600 dark:text-brand-400">
            {now.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── SECTION 2 · Statistics Cards ──────────────────────────────────── */}
      <div className="mb-10">
        <SectionHeader title="Overview" subtitle="Your test generation statistics at a glance" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            gradient="from-brand-500 to-indigo-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Total User Stories"
            value={stats?.totalStories ?? 0}
            description="Stories submitted for generation"
          />
          <StatCard
            gradient="from-purple-500 to-violet-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="Total Test Cases"
            value={stats?.totalTestCases ?? 0}
            description="Sum of all positive, negative & edge"
          />
          <StatCard
            gradient="from-emerald-500 to-green-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Avg Coverage Score"
            value={`${stats?.avgCoverage ?? 0}%`}
            description="Average across all generations"
          />
          <StatCard
            gradient="from-amber-500 to-orange-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Avg AI Confidence"
            value={`${stats?.avgConfidence ?? 0}%`}
            description="Model confidence in generated cases"
          />
          <StatCard
            gradient="from-rose-500 to-pink-600"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            title="Feature Files"
            value={stats?.totalFeatureFiles ?? 0}
            description=".feature files generated"
          />
        </div>
      </div>

      {/* ── SECTIONS 3 & 4 · Charts Row ───────────────────────────────────── */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">

        {/* Section 3 — Scenario Distribution Pie Chart */}
        <div className="card">
          <SectionHeader
            title="Scenario Distribution"
            subtitle="Breakdown of generated test case types"
          />
          {!hasAnyData ? (
            <div className="flex h-56 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No data yet. Generate test cases to see the distribution.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {hasAnyData && (
            <div className="mt-2 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              {[
                { label: 'Positive', value: stats.totalPositive, color: 'text-green-600 dark:text-green-400' },
                { label: 'Negative', value: stats.totalNegative, color: 'text-red-600 dark:text-red-400' },
                { label: 'Edge', value: stats.totalEdge, color: 'text-amber-600 dark:text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4 — Coverage Analytics */}
        <div className="card">
          <SectionHeader
            title="Coverage Analytics"
            subtitle="Test coverage quality metrics"
          />
          {!hasAnyData ? (
            <div className="flex h-56 flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate test cases to see coverage analytics.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Average Coverage */}
              <div className="rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 p-4 dark:from-brand-900/20 dark:to-indigo-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Average Coverage</p>
                  <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                    {stats.avgCoverage}%
                  </span>
                </div>
                <ProgressBar value={stats.avgCoverage} color="from-brand-500 to-indigo-500" />
              </div>

              {/* Average Confidence */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 dark:from-emerald-900/20 dark:to-green-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Average AI Confidence</p>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {stats.avgConfidence}%
                  </span>
                </div>
                <ProgressBar value={stats.avgConfidence} color="from-emerald-500 to-green-400" />
              </div>

              {/* Coverage Trend — per-recent entry */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Coverage Trend{' '}
                  <span className="font-normal text-gray-400">(last {recent.length} runs)</span>
                </p>
                <div className="space-y-2">
                  {recent.map((item, i) => (
                    <ProgressBar
                      key={item.id}
                      value={Math.round(item.coverage_score)}
                      color={
                        item.coverage_score >= 80
                          ? 'from-emerald-500 to-green-400'
                          : item.coverage_score >= 60
                          ? 'from-amber-500 to-yellow-400'
                          : 'from-red-500 to-rose-400'
                      }
                      label={`Run ${recent.length - i}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 5 · Recent Activity ───────────────────────────────────── */}
      <div className="mb-10">
        <SectionHeader
          title="Recent Activity"
          subtitle="Your 5 most recent test case generations"
        />
        {recent.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No activity yet</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Head to the Generator to create your first test cases.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <div
                key={item.id}
                className="card animate-slide-up flex flex-col gap-4 transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {truncate(item.story)}
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
                    <span
                      className={`font-semibold ${
                        item.coverage_score >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.coverage_score >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {Math.round(item.coverage_score)}% coverage
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewResult(item.id)}
                  disabled={viewingId === item.id}
                  className="btn-primary shrink-0 text-xs"
                >
                  {viewingId === item.id ? 'Loading…' : 'View Result'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 6 · Quick Actions ─────────────────────────────────────── */}
      <div>
        <SectionHeader title="Quick Actions" subtitle="Jump straight into your workflow" />
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate('/generator')}
            className="group card flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Generate New Test Cases</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Paste a user story and let AI do the work
              </p>
            </div>
            <svg className="ml-auto h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="group card flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">View History</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Browse and manage all past generations
              </p>
            </div>
            <svg className="ml-auto h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
