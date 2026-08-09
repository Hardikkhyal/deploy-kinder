import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { Server, Trash2, Plus, Terminal } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export default function Servers() {
  const [integrations, setIntegrations] = useState<any>({ awsCreds: [], instances: [] });

  // SSH Instance form states
  const [serverName, setServerName] = useState('');
  const [publicIp, setPublicIp] = useState('');
  const [sshUser, setSshUser] = useState('ubuntu');
  const [privateKey, setPrivateKey] = useState('');
  const selectedAwsCred = '';
  const selectedAwsInstanceId = '';

  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const { showToast } = useToastStore();

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/instances', {
        name: serverName,
        publicIp,
        sshUser,
        sshPrivateKey: privateKey,
        awsCredId: selectedAwsCred || null,
        awsInstanceId: selectedAwsInstanceId || null,
      });
      showToast('Server Instance registered!', 'success');
      setServerName('');
      setPublicIp('');
      setPrivateKey('');
      fetchIntegrations();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to register Server Instance', 'error');
    }
  };

  const handleDeleteServer = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/auth/instances/${id}`);
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Servers</h1>
        <p className="text-xs text-white/50 mt-1">Manage EC2 targets for your deployment pipelines</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* ── Left: Connected EC2 Servers ── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Server size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Connected Nodes</h3>
                <p className="text-[10px] text-white/50 font-medium">Your registered deploy targets</p>
              </div>
            </div>

            {integrations.instances.length === 0 ? (
              <p className="text-white/40 italic text-xs font-medium text-center py-4">No servers connected yet.</p>
            ) : (
              <div className="space-y-3">
                {integrations.instances.map((inst: any) => (
                  <div key={inst.id} className="bg-black/30 border border-white/5 rounded-lg p-4 transition-all hover:border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-xs tracking-tight">{inst.name}</h4>
                        <p className="text-[10px] text-white/40 font-mono mt-1">{inst.sshUser}@{inst.publicIp}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#28c840] bg-[#28c840]/10 px-2 py-0.5 rounded-full shrink-0">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28c840] opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                        </span>
                        Ready
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteServer(inst.id)}
                      disabled={deletingId === inst.id}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 ring-1 ring-red-500/20 px-3 py-2 rounded-md transition-colors font-medium"
                    >
                      <Trash2 size={13} />
                      {deletingId === inst.id ? 'Deleting…' : 'Remove Server'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Register Server Form ── */}
        <div className="xl:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 text-white/50 flex items-center justify-center border border-white/10">
              <Terminal size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Register Target Server</h3>
              <p className="text-[10px] text-white/50 font-medium">Add an EC2 or any SSH-accessible instance</p>
            </div>
          </div>

          <form onSubmit={handleAddServer} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Server Label Name</label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all"
                placeholder="production-node-1"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Public IP / Host</label>
              <input
                type="text"
                value={publicIp}
                onChange={(e) => setPublicIp(e.target.value)}
                className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs font-mono focus:ring-blue-500 outline-none transition-all"
                placeholder="198.51.100.1"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">SSH Username</label>
              <input
                type="text"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
                className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Private SSH Key (PEM format)</label>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs font-mono h-32 leading-relaxed focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder={'-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----'}
                required
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-6 py-2.5 rounded-md transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Register Node
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
