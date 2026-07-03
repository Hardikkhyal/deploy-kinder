import { useState } from 'react';
import { LayoutDashboard, FileCode, Link2, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newDark = !darkMode;
    document.documentElement.classList.add('theme-transitioning');
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 600);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-[50px] text-sm font-medium transition-all duration-200
    ${isActive(path)
      ? 'soft-shadow-inset text-text-soft bg-bg-soft'
      : 'text-text-muted hover:text-text-soft hover:soft-shadow-small hover:bg-bg-soft'}
  `;

  return (
    <aside className="w-64 bg-bg-soft flex flex-col justify-between p-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-soft mb-8 flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5">
            <span>DevOpsHub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 self-end mb-1.5"></span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-muted hover:text-text-soft hover:soft-shadow-inset transition-all duration-200 cursor-pointer flex items-center justify-center bg-bg-soft soft-shadow-small"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </h2>
        <nav className="space-y-2 flex flex-col">
          <Link to="/" className={linkClass('/')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/projects" className={linkClass('/projects')}>
            <FileCode size={18} />
            <span>Projects</span>
          </Link>
          <Link to="/integrations" className={linkClass('/integrations')}>
            <Link2 size={18} />
            <span>Integrations</span>
          </Link>
        </nav>
      </div>
      <button 
        onClick={logout} 
        className="flex items-center gap-3 text-text-muted hover:text-[#EF4444] hover:soft-shadow-inset hover:bg-bg-soft px-4 py-3 rounded-[50px] transition-all duration-200 cursor-pointer text-left w-full text-sm font-medium"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
