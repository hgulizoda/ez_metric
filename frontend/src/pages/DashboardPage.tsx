import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">EZ Metric</h1>
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            <span className="text-sm text-slate-600 dark:text-slate-300">
              {user?.username}{' '}
              <span className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded">
                {user?.role}
              </span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-slate-600 dark:text-slate-400">Welcome, {user?.username}. Dashboard coming soon.</p>
      </main>
    </div>
  );
}
