import { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import api from '../services/api';
import { Cpu, HardDrive, Server, Activity, Flame, RefreshCw, CircleDot } from 'lucide-react';

interface AppStat {
  projectId: string;
  projectName: string;
  serverName: string;
  serverIp: string;
  port: number;
  status: string;
  cpu: number;
  mem: string;
  memPerc: number;
}

interface TimelinePoint {
  time: string;
  avgCpu: number;
  avgRam: number;
}

export default function Monitoring() {
  const [appStats, setAppStats] = useState<AppStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get('/projects/stats', { signal });
      const stats: AppStat[] = res.data || [];
      setAppStats(stats);

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const totalCpu = stats.reduce((acc, s) => acc + s.cpu, 0);
      const avgCpu = stats.length > 0 ? Math.round(totalCpu / stats.length) : 0;
      const totalRam = stats.reduce((acc, s) => acc + s.memPerc, 0);
      const avgRam = stats.length > 0 ? Math.round(totalRam / stats.length) : 0;

      setTimelineData((prev) => {
        const updated = [...prev, { time: nowStr, avgCpu, avgRam }];
        return updated.slice(-15);
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStats(controller.signal);
      }
    }, 5000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchStats]);

  const topCpuApp = useMemo(() => {
    if (appStats.length === 0) return null;
    return [...appStats].sort((a, b) => b.cpu - a.cpu)[0];
  }, [appStats]);

  const topRamApp = useMemo(() => {
    if (appStats.length === 0) return null;
    return [...appStats].sort((a, b) => b.memPerc - a.memPerc)[0];
  }, [appStats]);

  const getCpuBadgeColor = (cpu: number) => {
    if (cpu > 75) return 'text-red-400 bg-red-500/10 ring-red-500/20';
    if (cpu > 30) return 'text-amber-400 bg-amber-500/10 ring-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20';
  };

  const getCpuBarColor = (cpu: number) => {
    if (cpu > 75) return 'bg-red-500';
    if (cpu > 30) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="text-blue-500" size={24} />
            Resource & CPU Monitor
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Real-time CPU and RAM utilization for all running applications across your EC2 instances
          </p>
        </div>

        <button
          onClick={() => fetchStats()}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-3.5 py-2 rounded-lg ring-1 ring-white/10 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
              Active Apps Monitored
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight">{appStats.length}</span>
            <span className="text-[11px] text-white/50 block mt-1">Live Docker containers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Server size={20} />
          </div>
        </div>

        <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1 mb-1">
              <Flame size={12} /> Highest CPU Consumer
            </span>
            <span className="text-base font-bold text-white tracking-tight truncate block max-w-[180px]">
              {topCpuApp ? topCpuApp.projectName : 'None'}
            </span>
            <span className="text-xs font-mono font-semibold text-amber-400 mt-1 block">
              {topCpuApp ? `${topCpuApp.cpu.toFixed(1)}% CPU` : '0%'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu size={20} />
          </div>
        </div>

        <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/80 flex items-center gap-1 mb-1">
              <HardDrive size={12} /> Highest RAM Consumer
            </span>
            <span className="text-base font-bold text-white tracking-tight truncate block max-w-[180px]">
              {topRamApp ? topRamApp.projectName : 'None'}
            </span>
            <span className="text-xs font-mono font-semibold text-purple-400 mt-1 block">
              {topRamApp ? `${topRamApp.memPerc.toFixed(1)}% (${topRamApp.mem})` : '0 B'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardDrive size={20} />
          </div>
        </div>
      </div>

      {/* Per-App Resource Breakdown Table */}
      <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-6 mb-8">
        <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cpu size={16} className="text-blue-400" />
            Per-App Resource Usage Breakdown
          </span>
          <span className="text-[10px] font-mono text-white/40">Sorted by CPU consumption</span>
        </h3>

        {appStats.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-xs italic">
            No running deployment instances detected on your servers. Deploy an app to view live CPU and Memory stats.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 text-white/40 uppercase tracking-wider text-[10px] border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold">Application</th>
                  <th className="px-4 py-3 font-semibold">Target Server</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">CPU Usage (%)</th>
                  <th className="px-4 py-3 font-semibold">RAM Usage (%)</th>
                  <th className="px-4 py-3 font-semibold text-right">Memory (Used / Limit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {appStats.map((app) => (
                  <tr key={app.projectId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{app.projectName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-white/60">
                      {app.serverName} ({app.serverIp}:{app.port})
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                        <CircleDot size={10} className="animate-pulse" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-black/40 rounded-full h-1.5 overflow-hidden ring-1 ring-white/5">
                          <div
                            className={`h-full ${getCpuBarColor(app.cpu)} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(2, app.cpu))}%` }}
                          />
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ring-1 ${getCpuBadgeColor(app.cpu)}`}>
                          {app.cpu.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-purple-300">
                      {app.memPerc.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-white/60 text-right">
                      {app.mem}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Aggregate Timeline Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center justify-between">
            <span>Average Server CPU Load (%)</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Live stream</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="avgCpu" name="Avg CPU %" stroke="#22C55E" strokeWidth={2} fillOpacity={0.15} fill="#22C55E" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center justify-between">
            <span>Average Server RAM Usage (%)</span>
            <span className="text-[10px] text-blue-400 font-mono font-semibold">Live stream</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} dx={-10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="avgRam" name="Avg RAM %" stroke="#2563EB" strokeWidth={2} fillOpacity={0.15} fill="#2563EB" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
