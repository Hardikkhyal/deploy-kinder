import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { Key, Github, Server, Cloud, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Integrations() {
  const [githubToken, setGithubToken] = useState('');
  const [integrations, setIntegrations] = useState<any>({ githubConnected: false, awsConnected: false, awsCreds: [], instances: [] });
  
  // AWS form states
  const [awsName, setAwsName] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  
  // SSH Instance form states
  const [serverName, setServerName] = useState('');
  const [publicIp, setPublicIp] = useState('');
  const [sshUser, setSshUser] = useState('ubuntu');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedAwsCred, setSelectedAwsCred] = useState('');
  const [selectedAwsInstanceId, setSelectedAwsInstanceId] = useState('');
  
  // Query results
  const [awsInstances, setAwsInstances] = useState<any[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);

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
      alert('GitHub token linked!');
      setGithubToken('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
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
      alert('AWS credentials saved!');
      setAwsName('');
      setAccessKey('');
      setSecretKey('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchInstances = async (credId: string) => {
    setLoadingInstances(true);
    try {
      const res = await api.get(`/auth/aws/${credId}/instances`);
      setAwsInstances(res.data);
      setSelectedAwsCred(credId);
    } catch (err) {
      alert('Failed to query instances from AWS. Check your key permissions.');
      console.error(err);
    } finally {
      setLoadingInstances(false);
    }
  };

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
      alert('Server Instance registered!');
      setServerName('');
      setPublicIp('');
      setPrivateKey('');
      setSelectedAwsInstanceId('');
      fetchIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  const selectQueriedInstance = (inst: any) => {
    setServerName(inst.name);
    setPublicIp(inst.publicIp);
    setSelectedAwsInstanceId(inst.instanceId);
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold tracking-tight text-text-soft mb-8">Cloud & VCS Integrations</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* GitHub integration */}
        <div className="SoftCard">
          <div className="flex items-center gap-3 mb-6">
            <div className="SoftIconContainer">
              <Github size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-soft tracking-tight">GitHub Access Link</h3>
              <p className="text-xs text-text-muted font-medium">Provide token to select and deploy repositories</p>
            </div>
            {integrations.githubConnected && (
              <span className="ml-auto text-xs SoftBadge SoftBadgeGreen">
                <CheckCircle2 size={12} /> Connected
              </span>
            )}
          </div>
          <form onSubmit={handleConnectGithub} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Personal Access Token</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="SoftInput w-full font-mono placeholder-neutral-350"
                placeholder="ghp_********************************"
                required
              />
            </div>
            <button type="submit" className="SoftButton px-5 py-3 text-sm font-semibold hover:shadow-sm">
              Save VCS Token
            </button>
          </form>
        </div>

        {/* AWS Credentials */}
        <div className="SoftCard">
          <div className="flex items-center gap-3 mb-6">
            <div className="SoftIconContainer">
              <Cloud size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-soft tracking-tight">AWS IAM Credentials</h3>
              <p className="text-xs text-text-muted font-medium">Authorize access to list EC2 server instances</p>
            </div>
          </div>
          <form onSubmit={handleConnectAws} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Account Label Name</label>
              <input type="text" value={awsName} onChange={(e) => setAwsName(e.target.value)} className="SoftInput w-full" placeholder="My EC2 Project Provider" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Access Key ID</label>
              <input type="text" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className="SoftInput w-full font-mono" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Secret Access Key</label>
              <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="SoftInput w-full font-mono" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Region</label>
              <input type="text" value={awsRegion} onChange={(e) => setAwsRegion(e.target.value)} className="SoftInput w-full" required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="SoftButton px-5 py-3 text-sm font-semibold hover:shadow-sm">
                Save AWS Keys
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Connected AWS Account Cards */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-text-soft mb-4 flex items-center gap-2">
            <Key size={18} className="text-text-muted" /> Connected AWS Keys
          </h2>
          {integrations.awsCreds.length === 0 ? (
            <div className="text-text-muted italic text-sm font-medium">No AWS Credentials connected yet.</div>
          ) : (
            integrations.awsCreds.map((c: any) => (
              <div key={c.id} className="bg-bg-soft soft-shadow-small p-5 rounded-[18px] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text-soft text-sm tracking-tight">{c.name}</h4>
                  <p className="text-[10px] text-text-muted font-mono uppercase mt-0.5 font-bold">{c.region}</p>
                </div>
                <button onClick={() => handleFetchInstances(c.id)} className="SoftButton text-xs px-3 py-2 hover:shadow-sm flex items-center gap-1 font-semibold">
                  {loadingInstances ? 'Loading...' : 'Fetch EC2s'} <ChevronRight size={14} />
                </button>
              </div>
            ))
          )}

          {/* AWS EC2 Query Results */}
          {awsInstances.length > 0 && (
            <div className="SoftCard mt-6">
              <h3 className="font-bold text-text-soft text-sm mb-4">Select EC2 Instance</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {awsInstances.map((inst) => (
                  <div key={inst.instanceId} onClick={() => selectQueriedInstance(inst)} className="bg-bg-soft soft-shadow-inset hover:soft-shadow-small hover:bg-bg-soft p-3 rounded-[12px] cursor-pointer transition-colors text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-text-soft">{inst.name}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">{inst.state}</span>
                    </div>
                    <div className="text-[11px] text-text-muted font-mono font-semibold">{inst.publicIp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Server Instance Register Form */}
        <div className="xl:col-span-2 SoftCard">
          <h2 className="text-xl font-bold tracking-tight text-text-soft mb-6 flex items-center gap-2">
            <Server size={18} className="text-text-muted" /> Link Deploy Target EC2 Server
          </h2>
          <form onSubmit={handleAddServer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Server Label Name</label>
              <input type="text" value={serverName} onChange={(e) => setServerName(e.target.value)} className="SoftInput w-full" placeholder="My AWS Production VM" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Public IP / Host</label>
              <input type="text" value={publicIp} onChange={(e) => setPublicIp(e.target.value)} className="SoftInput w-full font-mono" placeholder="e.g. 1.2.3.4" required />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">SSH Username</label>
              <input type="text" value={sshUser} onChange={(e) => setSshUser(e.target.value)} className="SoftInput w-full" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Private SSH Key (PEM format)</label>
              <textarea
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="SoftInput w-full font-mono text-xs h-32 leading-relaxed"
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="SoftButton px-5 py-3 text-sm font-semibold hover:shadow-sm">
                Register Target Server
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
