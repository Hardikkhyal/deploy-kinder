import { useCallback } from 'react';
import { 
  PanelLeft, ChevronLeft, ChevronRight, Monitor, 
  RotateCw, Share, Plus, Copy, Server, Layers, Grid,
  Info, Link2, LogOut, Activity
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Toast from '../Toast';
import { useToastStore } from '../../store/toastStore';
import { memo } from 'react';

// React.memo: AppLayout only re-renders when its own props change.
// Since it receives only `children`, it won't re-render just because a page's
// internal state (like form inputs) changes.
const AppLayout = memo(function AppLayout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { showToast } = useToastStore();
  const location = useLocation();
  const navigate = useNavigate();

  const userName = user?.name || user?.email?.split('@')[0] || 'My Workspace';
  const userInitial = userName.charAt(0).toUpperCase();

  // useCallback: stable reference means <Link> children don't re-render on AppLayout re-render
  const isActive = useCallback((path: string) => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const navClass = useCallback((path: string) => `
    text-[12px] hover:bg-white/5 px-3 py-2 rounded-md cursor-pointer flex items-center gap-2.5 transition-colors font-medium
    ${isActive(path) ? 'bg-white/10 text-white' : 'text-white/60'}
  `, [isActive]);

  return (
    <div className="min-h-screen bg-[#08080a] p-2 sm:p-4 lg:p-6 flex items-center justify-center font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background image: fetchpriority=high ensures it's preloaded (matches the <link rel=preload> in index.html).
          decoding=async keeps image decode off the main thread so it doesn't block interaction. */}
      <img 
        src="/marvels-spider-man-3840x2160-11990.jpeg" 
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-0 brightness-100 contrast-105"
      />

      {/* Crystal clear light overlay & ambient red/blue glowing liquid glass orbs */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="w-full max-w-[1600px] h-[92vh] min-h-[600px] flex flex-col rounded-2xl overflow-hidden glass-panel shadow-[0_24px_80px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Title bar */}
        <div className="glass-topbar px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.6)]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.6)]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.6)]"></span>
            </div>
            <div className="flex items-center gap-2">
              <PanelLeft className="w-3.5 h-3.5 text-white/40" />
              <button 
                onClick={() => navigate(-1)} 
                className="hover:text-white transition-colors focus:outline-none cursor-pointer"
                title="Go Back"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => navigate(1)} 
                className="hover:text-white transition-colors focus:outline-none cursor-pointer"
                title="Go Forward"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-lg px-6 py-1 text-[10px] text-white/70 shadow-inner">
            <Monitor className="w-3 h-3 text-blue-400" />
            selfhost.io{location.pathname}
          </div>
          
          <div className="flex items-center gap-3 text-white/40">
            <button 
              onClick={() => window.location.reload()}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Selfhost', url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied!', 'success');
                }
              }}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="Share"
            >
              <Share className="w-3.5 h-3.5" />
            </button>
            <button 
              // Fixed: was `window.location.href = '/projects'` which caused a full page reload,
              // destroying React state and restarting the entire JS runtime.
              onClick={() => navigate('/projects')}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Copied to clipboard!', 'success');
              }}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 glass-sidebar px-4 py-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-1">
                <Link to="/projects" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer decoration-none">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
                    <svg viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4 text-white">
                      <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">Selfhost</span>
                </Link>
                <Grid className="w-4 h-4 text-white/30" />
              </div>
              
              <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shadow-md uppercase border border-white/20">{userInitial}</div>
                <div className="flex flex-col">
                  <span className="text-xs text-white/90 font-semibold truncate max-w-[140px]">{userName}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-bold text-white/40 px-2 mb-1 uppercase tracking-wider">Main Menu</div>
                
                <Link to="/projects" className={navClass('/projects')}>
                  <Layers className="w-4 h-4" /> Projects
                </Link>
                <Link to="/monitoring" className={navClass('/monitoring')}>
                  <Activity className="w-4 h-4" /> Monitoring
                </Link>
                <Link to="/servers" className={navClass('/servers')}>
                  <Server className="w-4 h-4" /> Servers
                </Link>
                <Link to="/integrations" className={navClass('/integrations')}>
                  <Link2 className="w-4 h-4" /> Integrations
                </Link>
                <Link to="/about" className={navClass('/about')}>
                  <Info className="w-4 h-4" /> About Us
                </Link>
              </div>
            </div>

            <button 
              onClick={logout} 
              className="flex items-center gap-2.5 text-white/50 hover:text-[#ff5f57] hover:bg-white/10 px-3 py-2.5 rounded-xl border border-transparent hover:border-red-500/20 transition-all text-[12px] font-medium backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-transparent p-6 lg:p-10 text-white relative z-0">
            {children}
          </main>
        </div>
      </div>
      <Toast />
    </div>
  );
});

export default AppLayout;
