import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { 
  FolderGit2, Play, CircleDot, Terminal, Server, Trash2, 
  ExternalLink, AlertCircle, Download, Copy, RotateCcw, 
  FileText, Check, ChevronRight, CheckCircle2, XCircle, HelpCircle
} from 'lucide-react';
import LogTerminal from '../components/LogTerminal';

const STAGE_ORDER = [
  'Validating Configuration',
  'SSH Authentication',
  'Checking Server Environment',
  'Preparing Workspace',
  'Cloning Repository',
  'Detecting Framework',
  'Building Docker Image',
  'Starting Container',
  'Health Check'
];

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDiagnosticDeploy, setSelectedDiagnosticDeploy] = useState<{ project: any; deploy: any } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [serverId, setServerId] = useState('');
  const [port, setPort] = useState('8080');

  const isPortConflicting = projects.some(
    (p) => p.serverId === serverId && p.port === parseInt(port)
  );

  const conflictingProjectName = projects.find(
    (p) => p.serverId === serverId && p.port === parseInt(port)
  )?.name;

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data);

      const integRes = await api.get('/auth/integrations');
      setServers(integRes.data.instances || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId) {
      alert('Please select a target EC2 server for deployment.');
      return;
    }
    if (isPortConflicting) {
      alert(`Port ${port} is already in use by project "${conflictingProjectName}" on this server. Please choose another port.`);
      return;
    }
    try {
      await api.post('/projects', { name, repoUrl, branch, serverId, port });
      setShowModal(false);
      setName('');
      setRepoUrl('');
      setBranch('main');
      setServerId('');
      setPort('8080');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeploy = async (id: string) => {
    try {
      await api.post(`/projects/${id}/deploy`);
      alert('Deployment triggered!');
      setSelectedDiagnosticDeploy(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also stop and remove any active containers on the target server.')) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    }
  };

  const formatDuration = (ms: number | null): string => {
    if (ms === null || ms === undefined) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getFailedStage = (deploy: any) => {
    return (deploy?.stages || []).find((s: any) => s.status === 'FAILED');
  };

  const buildDiagnosticText = (project: any, deploy: any, failedStage: any) => {
    return `DEVOPSHUB DEPLOYMENT DIAGNOSTIC REPORT
=========================================
Deployment ID: ${deploy.id}
Project Name: ${project.name}
Target Server: ${project.server?.name || 'N/A'} (${project.server?.publicIp || 'N/A'})
Repository: ${project.repoUrl} (${project.branch})
Internal Port: ${project.port}
Timestamp: ${new Date(deploy.startedAt).toLocaleString()}
Duration: ${deploy.completedAt ? formatDuration(new Date(deploy.completedAt).getTime() - new Date(deploy.startedAt).getTime()) : 'N/A'}

FAILED STAGE: ${failedStage?.name || 'N/A'}
-----------------------------------------
Reason: ${failedStage?.errorReason || 'Unknown error occurred'}
Possible Causes:
${failedStage?.possibleCauses || '- Unknown'}
Suggested Fix:
${failedStage?.suggestedFix || 'Inspect raw logs.'}

STAGE RUNTIME SUMMARY:
-----------------------------------------
${[...(deploy.stages || [])]
  .sort((a: any, b: any) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name))
  .map((s: any) => `${s.name}: ${s.status} (${s.durationMs ? formatDuration(s.durationMs) : '0s'})`)
  .join('\n')}

=========================================
Generated automatically by DevOpsHub Self-Healing Engine.
`;
  };

  const downloadReport = (project: any, deploy: any) => {
    const failedStage = getFailedStage(deploy);
    const text = buildDiagnosticText(project, deploy, failedStage);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic_report_${project.name}_${deploy.id.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (project: any, deploy: any) => {
    const failedStage = getFailedStage(deploy);
    const text = buildDiagnosticText(project, deploy, failedStage);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'RUNNING':
        return <CircleDot className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />;
      case 'SKIPPED':
        return <HelpCircle className="w-5 h-5 text-neutral-400 flex-shrink-0" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-neutral-200 flex-shrink-0 bg-white" />;
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-soft">Projects</h1>
        <button
          onClick={() => {
            if (projects.length >= 10) {
              alert('you have to delete some of your old projects');
            }
            setShowModal(true);
          }}
          className="SoftButton px-4 py-2.5 text-sm font-semibold active:scale-[0.98]"
        >
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const latestDeploy = project.deployments?.[0];
          const failedStage = getFailedStage(latestDeploy);
          const currentStage = (latestDeploy?.stages || []).find((s: any) => s.status === 'RUNNING')?.name;

          return (
            <div key={project.id} className="SoftCard SoftCardHover flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-base font-bold text-text-soft tracking-tight">{project.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-text-muted capitalize">
                      {latestDeploy?.status === 'BUILDING' && currentStage ? `${currentStage.toLowerCase()}...` : latestDeploy?.status.toLowerCase() || 'no deploy'}
                    </span>
                    <CircleDot
                      size={14}
                      className={
                        latestDeploy?.status === 'SUCCESS'
                          ? 'text-emerald-500'
                          : latestDeploy?.status === 'BUILDING'
                          ? 'text-amber-500 animate-pulse'
                          : latestDeploy?.status === 'FAILED'
                          ? 'text-red-500'
                          : 'text-neutral-300'
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-text-muted flex items-center gap-1.5 mb-2 font-mono font-medium">
                  <FolderGit2 size={13} className="text-text-muted" />
                  <span className="truncate">{project.repoUrl} ({project.branch})</span>
                </p>
                <p className="text-xs text-text-muted flex items-center gap-1.5 mb-4">
                  <Server size={13} className="text-blue-500" />
                  <span className="font-medium">Target: {project.server?.name} ({project.server?.publicIp}:{project.port})</span>
                </p>
                
                {latestDeploy?.status === 'FAILED' && (
                  <button
                    onClick={() => setSelectedDiagnosticDeploy({ project, deploy: latestDeploy })}
                    className="SoftButton text-xs text-red-650 dark:text-red-400 bg-bg-soft soft-shadow-small px-3 py-2 rounded-[12px] transition-all flex items-center justify-between w-full mb-4 cursor-pointer text-left font-sans font-semibold"
                    title="View diagnostics and self-healing analysis"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertCircle size={12} className="text-red-500 animate-pulse" />
                      <span className="truncate">
                        Diagnosis: {failedStage ? failedStage.name : 'Unknown Stage'} Failed
                      </span>
                    </div>
                    <ChevronRight size={10} className="text-red-400" />
                  </button>
                )}

                {latestDeploy?.status === 'BUILDING' && (
                  <button
                    onClick={() => setSelectedDiagnosticDeploy({ project, deploy: latestDeploy })}
                    className="SoftButton text-xs text-amber-700 dark:text-amber-400 bg-bg-soft soft-shadow-small px-3 py-2 rounded-[12px] transition-all flex items-center justify-between w-full mb-4 cursor-pointer text-left font-sans font-semibold"
                    title="View live deployment timeline"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CircleDot size={12} className="text-amber-500 animate-spin" />
                      <span className="truncate">
                        Tracking: {currentStage || 'Initializing'}
                      </span>
                    </div>
                    <ChevronRight size={10} className="text-amber-500" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {latestDeploy?.status === 'SUCCESS' && (
                  <a
                    href={`http://${project.server?.publicIp}:${project.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="SoftButton SoftButtonAccent flex-1 py-2.5 rounded-[12px] flex items-center justify-center gap-1.5 font-bold transition-all text-xs cursor-pointer decoration-none"
                    title="Open deployed website"
                  >
                    <ExternalLink size={13} />
                    <span>View Site</span>
                  </a>
                )}
                <button 
                  onClick={() => handleDeploy(project.id)} 
                  disabled={latestDeploy?.status === 'BUILDING'}
                  className={`${latestDeploy?.status === 'SUCCESS' ? 'px-3' : 'flex-1'} SoftButton py-2.5 rounded-[12px] flex items-center justify-center gap-2 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer`} 
                  title="Trigger new deployment"
                >
                  <Play size={13} />
                  {latestDeploy?.status !== 'SUCCESS' && <span>Deploy</span>}
                </button>
                <button onClick={() => setSelectedProjectId(project.id)} className="SoftButton p-2.5 rounded-[12px] flex items-center justify-center gap-2 font-semibold text-xs transition-all cursor-pointer" title="View deployment logs">
                  <Terminal size={13} />
                  <span>Logs</span>
                </button>
                <button onClick={() => handleDelete(project.id)} className="SoftButton SoftButtonDanger p-2.5 rounded-[12px] flex items-center justify-center transition-all cursor-pointer" title="Delete Project">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[1.5px] flex items-center justify-center p-4 z-50">
          {projects.length >= 10 ? (
            <div className="SoftModal w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-180">
              <h3 className="text-xl font-bold text-red-650 mb-4 flex items-center justify-center gap-2">
                <AlertCircle size={22} className="text-red-505" />
                <span>Limit Reached</span>
              </h3>
              <p className="text-sm text-text-muted mb-6 leading-relaxed font-medium">
                You have reached your limit of 10 active projects. You have to delete some of your old projects to develop your app.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="SoftButton w-full p-3 rounded-[12px] font-semibold text-sm transition-all"
              >
                Go Back
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="SoftModal w-full max-w-md p-8 animate-in fade-in zoom-in duration-180">
              <h3 className="text-xl font-bold text-text-soft tracking-tight mb-6">Link New Project</h3>
              
              <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Project Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="SoftInput w-full" required />
              </div>
              
              <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Git Repository URL</label>
                <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="SoftInput w-full placeholder-neutral-400" placeholder="https://github.com/username/repo" required />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Branch</label>
                  <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="SoftInput w-full" required />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Internal Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className={`SoftInput w-full ${isPortConflicting ? 'focus:outline-red-500' : ''}`}
                    required
                  />
                  {isPortConflicting && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">
                      ⚠️ Port in use by "{conflictingProjectName}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted mb-2 font-semibold">Target EC2 Instance</label>
                <select
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="SoftInput w-full cursor-pointer"
                  required
                >
                  <option value="">-- Select Target EC2 --</option>
                  {servers.map((s) => {
                    const takenPorts = projects.filter((p) => p.serverId === s.id).map((p) => p.port);
                    const portsLabel = takenPorts.length > 0 ? ` (ports used: ${takenPorts.join(', ')})` : '';
                    return (
                      <option key={s.id} value={s.id}>{s.name} ({s.publicIp}){portsLabel}</option>
                    );
                  })}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="SoftButton flex-1 p-3 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={isPortConflicting} className="SoftButton SoftButtonAccent flex-1 p-3 text-sm font-semibold">Add Project</button>
              </div>
            </form>
          )}
        </div>
      )}

      {selectedProjectId && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[1.5px] flex items-center justify-center p-4 z-50">
          <div className="SoftModal w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-180">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-text-soft flex items-center gap-2 tracking-tight">
                <Terminal className="text-text-muted" size={18} />
                <span>Live Deployment Logs</span>
              </h3>
              <button onClick={() => setSelectedProjectId(null)} className="text-text-muted hover:text-text-soft font-bold text-lg cursor-pointer focus:outline-none">✕</button>
            </div>
            <LogTerminal 
              projectId={selectedProjectId} 
              initialStages={projects.find(p => p.id === selectedProjectId)?.deployments?.[0]?.stages || []} 
            />
          </div>
        </div>
      )}

      {/* Deployment Diagnostic & Stage Timeline Modal */}
      {selectedDiagnosticDeploy && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-[1.5px] flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="SoftModal w-full max-w-3xl p-8 my-8 animate-in fade-in zoom-in duration-180">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-soft tracking-tight flex items-center gap-2">
                  <FileText className="text-text-muted" size={18} />
                  <span>Deployment Control Room</span>
                </h3>
                <p className="text-xs text-text-muted mt-1 font-mono font-semibold">
                  ID: {selectedDiagnosticDeploy.deploy.id} | Project: {selectedDiagnosticDeploy.project.name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDiagnosticDeploy(null)} 
                className="text-text-muted hover:text-text-soft font-bold text-lg cursor-pointer focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Timeline Column */}
              <div className="md:col-span-5 bg-bg-soft soft-shadow-inset p-5 rounded-[20px]">
                <h4 className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-4 border-b border-neutral-200/10 dark:border-neutral-800/20 pb-2">
                  Stage Timeline
                </h4>
                <div className="relative border-l border-neutral-300 dark:border-neutral-800 ml-3 pl-6 space-y-5">
                  {[...(selectedDiagnosticDeploy.deploy.stages || [])]
                    .sort((a: any, b: any) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name))
                    .map((stage: any) => (
                      <div key={stage.id} className="relative">
                        {/* Timeline Node */}
                        <span className="absolute -left-[35px] top-0 bg-bg-soft p-0.5 rounded-full z-10 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40">
                          {getStageIcon(stage.status)}
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-xs font-semibold ${stage.status === 'RUNNING' ? 'text-amber-600 font-bold' : stage.status === 'FAILED' ? 'text-red-500 font-bold' : stage.status === 'SUCCESS' ? 'text-emerald-600' : 'text-neutral-400'}`}>
                            {stage.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-405 font-mono font-bold">
                            {stage.startedAt && <span>{formatTime(stage.startedAt)}</span>}
                            {stage.durationMs !== null && <span>({formatDuration(stage.durationMs)})</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Diagnostic Panel Column */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                {selectedDiagnosticDeploy.deploy.status === 'FAILED' ? (
                  <div className="flex-1 bg-bg-soft soft-shadow-inset border-l-4 border-red-500 p-5 rounded-[20px] space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-bg-soft soft-shadow-small rounded-lg text-red-550">
                        <AlertCircle size={18} className="text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-650 dark:text-red-400 tracking-tight leading-tight">
                          {getFailedStage(selectedDiagnosticDeploy.deploy)?.errorReason || 'Deployment Failure Detected'}
                        </h4>
                        <p className="text-[10px] text-text-muted font-mono font-bold mt-0.5">
                          Failed in Stage: {getFailedStage(selectedDiagnosticDeploy.deploy)?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">
                        Possible Causes
                      </span>
                      <div className="bg-bg-soft soft-shadow-inset p-3.5 rounded-[12px] text-xs text-text-soft whitespace-pre-line leading-relaxed font-medium">
                        {getFailedStage(selectedDiagnosticDeploy.deploy)?.possibleCauses || 'No causes classified.'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">
                        Suggested Fix
                      </span>
                      <div className="bg-bg-soft soft-shadow-inset p-3.5 rounded-[12px] text-xs text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                        {getFailedStage(selectedDiagnosticDeploy.deploy)?.suggestedFix || 'Check raw logs for details.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-bg-soft soft-shadow-inset p-5 rounded-[20px] flex flex-col items-center justify-center text-center space-y-3">
                    <CircleDot className="w-8 h-8 text-amber-500 animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-text-soft tracking-tight">Deployment in Progress</h4>
                      <p className="text-xs text-text-muted mt-1 max-w-xs font-semibold">
                        The self-healing orchestrator is running checks and deploying your container on the EC2 target server.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions Panel */}
                <div className="bg-bg-soft soft-shadow-inset p-4 rounded-[20px] flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadReport(selectedDiagnosticDeploy.project, selectedDiagnosticDeploy.deploy)}
                      className="SoftButton flex-1 p-2.5 text-xs font-semibold hover:shadow-sm active:scale-[0.98]"
                    >
                      <Download size={13} />
                      <span>Download Report</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedDiagnosticDeploy.project, selectedDiagnosticDeploy.deploy)}
                      className="SoftButton flex-1 p-2.5 text-xs font-semibold hover:shadow-sm active:scale-[0.98]"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied!' : 'Copy Report'}</span>
                    </button>
                  </div>
                  
                  {selectedDiagnosticDeploy.deploy.status === 'FAILED' && (
                    <button
                      onClick={() => handleDeploy(selectedDiagnosticDeploy.project.id)}
                      className="SoftButton SoftButtonAccent w-full p-3 font-bold text-xs active:scale-[0.98]"
                    >
                      <RotateCcw size={13} />
                      <span>Retry Deployment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
