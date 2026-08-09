import { useEffect, useRef, useState } from 'react';
import { 
  PanelLeft, ChevronLeft, ChevronRight, Monitor, 
  RotateCw, Share, Plus, Copy, Server, Sparkles, Activity, Layers, Grid
} from 'lucide-react';

export default function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    // Debounce timeout handle — prevents layout thrash from rapid resize events.
    // Without this, every pixel of resize triggers a synchronous offsetHeight read
    // which forces the browser to flush layout.
    let rafId: ReturnType<typeof setTimeout> | null = null;

    const observer = new ResizeObserver((entries) => {
      // Cancel any pending update from a previous resize event
      if (rafId !== null) clearTimeout(rafId);

      // Defer one frame so rapid consecutive resize events are batched into one
      rafId = setTimeout(() => {
        for (const entry of entries) {
          const containerWidth = entry.contentRect.width;
          // Design width is 896px
          const newScale = containerWidth / 896;
          setScale(newScale);

          if (innerRef.current) {
            setHeight(`${innerRef.current.offsetHeight * newScale}px`);
          }
        }
        rafId = null;
      }, 16); // ~1 animation frame
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) clearTimeout(rafId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="animate-hero-rise [animation-delay:620ms] relative z-0 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 -mb-10 sm:-mb-20 lg:-mb-32"
      style={{ height: height !== 'auto' ? height : undefined }}
    >
      <div 
        ref={innerRef}
        style={{ 
          width: '896px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
        className="rounded-t-2xl overflow-hidden bg-[#1a1a1c] shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left"
      >
        {/* Title bar */}
        <div className="bg-[#242427] border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></span>
            </div>
            <div className="flex items-center gap-2">
              <PanelLeft className="w-3.5 h-3.5 text-white/40" />
              <ChevronLeft className="w-3.5 h-3.5 text-white/40" />
              <ChevronRight className="w-3.5 h-3.5 text-white/25" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-[#1a1a1c] rounded-md px-6 py-1 text-[10px] text-white/60">
            <Monitor className="w-3 h-3" />
            selfhost.io
          </div>
          
          <div className="flex items-center gap-3 text-white/40">
            <RotateCw className="w-3.5 h-3.5" />
            <Share className="w-3.5 h-3.5" />
            <Plus className="w-3.5 h-3.5" />
            <Copy className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div className="w-[22%] border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 256 256" fill="currentColor" className="w-4 h-4 text-white/70">
                  <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
                </svg>
              </div>
              <Grid className="w-3.5 h-3.5 text-white/30" />
            </div>
            
            <div className="flex items-center gap-2 px-1">
              <div className="w-4 h-4 rounded bg-[#e8553f] flex items-center justify-center text-[10px] font-bold text-white">D</div>
              <span className="text-[10px] text-white/80">DeployCo</span>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="text-[10px] text-white/60 hover:bg-white/5 px-2 py-1.5 rounded cursor-default flex items-center gap-2 bg-white/10 text-white">
                <Layers className="w-3 h-3" /> Deployments
              </div>
              <div className="text-[10px] text-white/60 hover:bg-white/5 px-2 py-1.5 rounded cursor-default flex items-center gap-2">
                <Server className="w-3 h-3" /> Infrastructure
              </div>
              <div className="text-[10px] text-white/60 hover:bg-white/5 px-2 py-1.5 rounded cursor-default flex items-center gap-2">
                <Activity className="w-3 h-3" /> Monitoring
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[9px] font-semibold text-white/30 px-2 mb-2 uppercase tracking-wider">Active Pipelines</div>
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-white/70 flex items-center gap-2 px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28c840]/70"></span> Production
                </div>
                <div className="text-[10px] text-white/70 flex items-center gap-2 px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#febc2e]/70"></span> Staging 
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#1a1a1c] p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e8553f] flex items-center justify-center text-sm font-bold text-white">D</div>
                <div>
                  <div className="text-sm font-medium text-white">Deployments</div>
                  <div className="text-[10px] text-white/45">DeployCo Workspace</div>
                </div>
              </div>
              
              <button className="flex items-center gap-1.5 bg-gray-100 hover:bg-white text-gray-900 text-[10px] font-medium px-3 py-1.5 rounded-md transition-colors">
                <Sparkles className="w-3 h-3" /> Deploy Now
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 divide-x divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5">
              <div className="p-4 flex flex-col gap-1">
                <div className="text-[8px] tracking-wider text-white/35">RELEASED</div>
                <div className="text-xl font-medium text-white">62</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="text-[8px] tracking-wider text-white/35">BREADTH</div>
                <div className="text-xl font-medium text-white">12</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="text-[8px] tracking-wider text-white/35">REMAINING</div>
                <div className="text-xl font-medium text-white">412</div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="text-[8px] tracking-wider text-white/35">MAX REACH</div>
                <div className="text-xl font-medium text-white">3,156,200</div>
              </div>
            </div>

            {/* Subject cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                <div className="text-xs font-medium text-white">Elder Care</div>
                <div className="text-[10px] text-white/50">3 apps running</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                <div className="text-xs font-medium text-white">Mobility</div>
                <div className="text-[10px] text-white/50">8 apps running</div>
              </div>
              <div className="rounded-lg bg-white/[0.03] ring-1 ring-white/5 p-4 flex flex-col gap-2">
                <div className="text-xs font-medium text-white">Home Safety</div>
                <div className="text-[10px] text-white/50">1 app running</div>
              </div>
            </div>

            {/* Drafting inbox table (Pipelines) */}
            <div className="flex-1 rounded-lg border border-white/5 overflow-hidden">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-white/[0.02] text-white/40">
                  <tr>
                    <th className="px-4 py-2 font-medium">PIPELINE</th>
                    <th className="px-4 py-2 font-medium">TRIGGER</th>
                    <th className="px-4 py-2 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  <tr>
                    <td className="px-4 py-2.5">api-production-deploy</td>
                    <td className="px-4 py-2.5 text-white/40">commit #a1b2c3d</td>
                    <td className="px-4 py-2.5 text-right text-[#28c840]/80">Success</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">web-staging-build</td>
                    <td className="px-4 py-2.5 text-white/40">commit #f9e8d7c</td>
                    <td className="px-4 py-2.5 text-right text-[#febc2e]/80">Drafting</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">db-migration-job</td>
                    <td className="px-4 py-2.5 text-white/40">manual trigger</td>
                    <td className="px-4 py-2.5 text-right text-[#28c840]/80">Success</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">auth-service-deploy</td>
                    <td className="px-4 py-2.5 text-white/40">commit #b5c6d7e</td>
                    <td className="px-4 py-2.5 text-right text-[#28c840]/80">Success</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">analytics-worker</td>
                    <td className="px-4 py-2.5 text-white/40">commit #c8d9e0f</td>
                    <td className="px-4 py-2.5 text-right text-[#febc2e]/80">Drafting</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
