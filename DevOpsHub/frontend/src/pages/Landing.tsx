import { Link } from 'react-router-dom';
import { Terminal, Shield, Cpu, Activity, ArrowRight } from 'lucide-react';

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
    <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
  </svg>
);

export default function Landing() {
  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#08080c] flex flex-col font-sans selection:bg-blue-500/30 text-white">
      {/* High-fidelity ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none z-0" />

      {/* Tech grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between border-b border-white/5 bg-[#08080c]/50 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
            <Logo className="text-white w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">Selfhost</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] font-medium text-white/70 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold px-4.5 py-2 rounded-lg shadow-lg shadow-blue-500/20 border border-white/10 transition-all active:scale-[0.98]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-5xl mx-auto text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-medium text-blue-400 mb-6 shadow-inner animate-fade-in">
          <Terminal size={12} />
          <span>Automate Your Self-Hosted Server Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          Deploy Apps From GitHub <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Directly To Your Own Server
          </span>
        </h1>

        <p className="text-sm sm:text-base text-white/50 max-w-2xl mb-10 leading-relaxed font-light">
          A lightweight, self-hosted PaaS that handles code syncing, container building, dynamic Nginx routing, and live monitoring. Maintain full privacy and pay zero platform fees.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <Link to="/signup" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-8 py-3.5 rounded-xl border border-white/15 shadow-xl shadow-blue-600/10 transition-all active:scale-[0.98] cursor-pointer">
            <span>Start Deploying Free</span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-8 py-3.5 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer">
            <span>Access Dashboard</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/10 transition-all">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
              <Cpu size={16} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Automated Containerization</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Automatic technology detection for Node.js, Python, Django, or static HTML. Generates Docker configurations automatically.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/10 transition-all">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <Activity size={16} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Live Observability</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Stream deployment logs directly via WebSockets. Monitor CPU, memory, and database usage live in your browser dashboard.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/10 transition-all">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
              <Shield size={16} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Total Sovereignty</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Deploy on your AWS EC2 instance or any SSH node. You own the infrastructure, the access keys, and your database records.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 border-t border-white/5 text-center text-[11px] text-white/30 mt-auto bg-[#08080c]/30 backdrop-blur-sm">
        <span>&copy; {new Date().getFullYear()} Selfhost Engine. Open-source PaaS under MIT License.</span>
      </footer>
    </div>
  );
}
