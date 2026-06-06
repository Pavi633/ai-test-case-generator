import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/generator', label: 'Generator' },
    { to: '/history', label: 'History' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-lg shadow-brand-600/30">
            AI
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">AI Test Case Generator</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Case Generator from User Story</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Username badge */}
              <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 dark:border-gray-700 sm:flex">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {user.username}
                </span>
              </div>
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/40"
            >
              Login
            </Link>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
