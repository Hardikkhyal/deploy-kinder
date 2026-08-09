import AppLayout from '../components/layout/AppLayout';
import { Info } from 'lucide-react';

export default function AboutUs() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">About Selfhost</h1>
        <p className="text-xs text-white/50 mt-1">Built for modern software delivery teams.</p>
      </div>
      
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 max-w-3xl">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/60 mb-6 border border-white/10">
          <Info size={24} />
        </div>
        <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Our Mission</h2>
        <p className="text-sm text-white/70 leading-relaxed mb-6">
          Selfhost is a unified DevOps platform that helps development teams build, deploy, monitor, and manage applications faster through automation, Infrastructure as Code, CI/CD pipelines, and containerization.
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          We believe that software delivery should be effortless, secure, and accessible to teams of all sizes. By abstracting the complexity of cloud infrastructure, we empower developers to focus on writing great code rather than fighting with servers.
        </p>
      </div>
    </AppLayout>
  );
}
