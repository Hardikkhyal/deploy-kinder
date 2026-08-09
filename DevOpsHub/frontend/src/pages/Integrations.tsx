import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { Github, Cloud, CheckCircle2, Key, Trash2, Plus } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export default function Integrations() {
  const [githubToken, setGithubToken] = useState('');
  const [integrations, setIntegrations] = useState<any>({ githubConnected: false, awsConnected: false, awsCreds: [], instances: [] });
  
  // AWS form states
  const [awsName, setAwsName] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');

  const [deletingGithub, setDeletingGithub] = useState(false);
  const [deletingAwsId, setDeletingAwsId] = useState<string | null>(null);
  const { showToast } = useToastStore();
  
  const fetchIntegrations = async () => {
    try {
      const res = await api.get('/auth/integrations');
      setIntegrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/github', { githubToken });
      showToast('GitHub token linked!', 'success');
      setGithubToken('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
      showToast('Failed to link GitHub token', 'error');
    }
  };

  const handleConnectAws = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/aws', {
        name: awsName,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region: awsRegion
      });
      showToast('AWS credentials saved!', 'success');
      setAwsName('');
      setAccessKey('');
      setSecretKey('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
      showToast('Failed to save AWS credentials', 'error');
    }
  };

  const handleDeleteGithub = async () => {
    if (!confirm('Disconnect your GitHub token? You will need to re-add it to deploy from GitHub.')) return;
    setDeletingGithub(true);
    try {
      await api.delete('/auth/github');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingGithub(false);
    }
  };

  const handleDeleteAws = async (credId: string) => {
    if (!confirm('Delete this AWS credential? Any linked servers may lose connection.')) return;
    setDeletingAwsId(credId);
    try {
      await api.delete(`/auth/aws/${credId}`);
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAwsId(null);
    }
  };



  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Cloud & VCS Integrations</h1>
        <p className="text-xs text-white/50 mt-1">Connect your version control and cloud providers to enable deployments.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* GitHub integration */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 text-white/50 flex items-center justify-center border border-white/10">
              <Github size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">GitHub Access Link</h3>
              <p className="text-[10px] text-white/50 font-medium">Provide token to select and deploy repositories</p>
            </div>
            {integrations.githubConnected && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#28c840] bg-[#28c840]/10 px-2 py-1 rounded-md shrink-0">
                <CheckCircle2 size={12} /> Connected
              </span>
            )}
          </div>
          <form onSubmit={handleConnectGithub} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Personal Access Token</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs font-mono focus:ring-blue-500 outline-none transition-all"
                placeholder="ghp_********************************"
                required
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-5 py-2.5 rounded-md ring-1 ring-white/10 transition-colors">
                Save VCS Token
              </button>
              {integrations.githubConnected && (
                <button
                  type="button"
                  onClick={handleDeleteGithub}
                  disabled={deletingGithub}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium px-4 py-2.5 rounded-md ring-1 ring-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  {deletingGithub ? 'Disconnecting…' : 'Disconnect'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* AWS Credentials */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Cloud size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">AWS IAM Credentials</h3>
              <p className="text-[10px] text-white/50 font-medium">Authorize access to list EC2 server instances</p>
            </div>
            {integrations.awsConnected && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#28c840] bg-[#28c840]/10 px-2 py-1 rounded-md shrink-0">
                <CheckCircle2 size={12} /> Connected
              </span>
            )}
          </div>
          <form onSubmit={handleConnectAws} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Account Label Name</label>
              <input type="text" value={awsName} onChange={(e) => setAwsName(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all" placeholder="My EC2 Project Provider" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Access Key ID</label>
              <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs font-mono focus:ring-blue-500 outline-none transition-all" placeholder="AKIA..." required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Secret Access Key</label>
              <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs font-mono focus:ring-blue-500 outline-none transition-all" placeholder="****************" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Region</label>
              <input type="text" value={awsRegion} onChange={(e) => setAwsRegion(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all" placeholder="us-east-1" required />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-6 py-2.5 rounded-md transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Save AWS Keys
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Connected AWS Keys List ── */}
      {integrations.awsCreds && integrations.awsCreds.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Key size={14} className="text-white/40" /> Connected AWS Keys
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {integrations.awsCreds.map((cred: any) => (
              <div
                key={cred.id}
                className="bg-black/30 border border-white/5 rounded-lg p-4 flex items-center justify-between gap-3 transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Key size={14} className="text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{cred.name}</p>
                    <p className="text-[9px] font-mono font-semibold text-white/40 uppercase tracking-wider mt-0.5">{cred.region}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAws(cred.id)}
                  disabled={deletingAwsId === cred.id}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 px-2 py-1.5 rounded-md text-[10px] font-medium shrink-0 flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  {deletingAwsId === cred.id ? '...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
