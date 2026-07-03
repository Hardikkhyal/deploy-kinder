import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import AppLayout from '../components/layout/AppLayout';

// Mock data simulating 1-minute interval poll from Prometheus
const metricsData = [
  { time: '12:00', cpu: 15, ram: 42 },
  { time: '12:05', cpu: 32, ram: 44 },
  { time: '12:10', cpu: 75, ram: 50 },
  { time: '12:15', cpu: 45, ram: 52 },
  { time: '12:20', cpu: 20, ram: 48 },
];

export default function Monitoring() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold tracking-tight text-text-soft mb-8">Server Observability</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="SoftCard">
          <h3 className="text-base font-bold text-text-soft tracking-tight mb-4">CPU Utilization (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData}>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-small)' }}
                  labelStyle={{ color: 'var(--text-color)', fontWeight: 600, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#22C55E" strokeWidth={2.5} fillOpacity={0.05} fill="#22C55E" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="SoftCard">
          <h3 className="text-base font-bold text-text-soft tracking-tight mb-4">RAM Utilization (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData}>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-small)' }}
                  labelStyle={{ color: 'var(--text-color)', fontWeight: 600, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ram" stroke="#2563EB" strokeWidth={2.5} fillOpacity={0.05} fill="#2563EB" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
