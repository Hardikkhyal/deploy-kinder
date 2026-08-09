import { useState } from 'react';
import { Info, FileCode, Link2, LogOut, UserCircle, Server } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => {
    const active = isActive(path);
    return `
      flex items-center gap-2 px-5 h-full rounded-full text-sm font-medium transition-all duration-250 ease-out cursor-pointer
      ${active
        ? 'text-white bg-black/40 shadow-inner'
        : 'text-neutral-400 hover:text-white hover:bg-white/5 hover:-translate-y-[1px]'}
    `;
  };

  return (
    <header className="h-16 bg-transparent border-b border-transparent flex items-center justify-between px-6 relative z-50 shrink-0">
      {/* Logo */}
      <div className="flex items-center">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
          <span>SELFHOST</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 self-end mb-1.5"></span>
        </h2>
      </div>

      {/* Floating Pill Nav */}
      <nav
        className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-1 p-1.5 rounded-full bg-white/5 dark:bg-black/30 backdrop-blur-3xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.4)] animate-in slide-in-from-top-4 fade-in duration-500 h-[56px]"
      >
        <Link to="/" className={linkClass('/')}>
          {isActive('/') ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> : <Info size={16} />}
          <span>About Us</span>
        </Link>
        <Link to="/projects" className={linkClass('/projects')}>
          {isActive('/projects') ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> : <FileCode size={16} />}
          <span>Projects</span>
        </Link>
        <Link to="/integrations" className={linkClass('/integrations')}>
          {isActive('/integrations') ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> : <Link2 size={16} />}
          <span>Integrations</span>
        </Link>
        <Link to="/servers" className={linkClass('/servers')}>
          {isActive('/servers') ? <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" /> : <Server size={16} />}
          <span>Servers</span>
        </Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-4">


        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
          >
            <UserCircle className="w-6 h-6 text-text-muted" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white/5 dark:bg-black/30 backdrop-blur-3xl border border-white/20 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)] py-4 px-4 z-50">
              <div className="flex flex-col gap-1 mb-4 border-b border-white/10 pb-4">
                <span className="text-sm font-semibold text-text-color mb-2">Profile Details</span>
                <div className="text-xs text-text-muted break-all">
                  <span className="font-medium text-text-soft">Username:</span> {user?.username || 'N/A'}
                </div>
                <div className="text-xs text-text-muted break-all">
                  <span className="font-medium text-text-soft">Email:</span> {user?.email || 'N/A'}
                </div>
                <div className="text-xs text-text-muted break-all mt-1">
                  <span className="font-medium text-text-soft">ID:</span> {user?.id || 'N/A'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
