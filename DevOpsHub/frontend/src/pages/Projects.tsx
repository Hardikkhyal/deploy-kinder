import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import api from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { 
  FolderGit2, Play, Pause, CircleDot, Terminal, Server, Trash2, 
  ExternalLink, AlertCircle, Download, Copy, RotateCcw, 
  Check, ChevronRight, CheckCircle2, XCircle, HelpCircle, Plus, Activity
} from 'lucide-react';
import LogTerminal from '../components/LogTerminal';
import { useToastStore } from '../store/toastStore';

// Shared constant — defined once, not recreated on every render
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

// ─── ProjectCard: React.memo prevents re-renders unless THIS card's data changes ───
// Without this, ALL cards re-render every 4 seconds when fetchData() runs.
// With this, only cards whose project data actually changed re-render.
interface ProjectCardProps {
  project: any;
  pausingId: string | null;
  resumingId: string | null;
  restartingId: string | null;
  onDeploy: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenLogs: (id: string) => void;
  onOpenDiagnostic: (project: any, deploy: any) => void;
  formatRepoName: (url: string) => string;
  formatDuration: (ms: number | null) => string;
  getFailedStage: (deploy: any) => any;
}

const ProjectCard = memo(function ProjectCard({
  project,
  pausingId,
  resumingId,
  restartingId,
  onDeploy,
  onPause,
  onResume,
  onRestart,
  onDelete,
  onOpenLogs,
  onOpenDiagnostic,
  formatRepoName,
  getFailedStage,
}: ProjectCardProps) {
  const latestDeploy = project.deployments?.[0];
  const failedStage = getFailedStage(latestDeploy);
  const currentStage = (latestDeploy?.stages || []).find((s: any) => s.status === 'RUNNING')?.name;

  return (
    <div className="bg-white/[0.03] ring-1 ring-white/5 rounded-xl p-5 flex flex-col justify-between min-h-[240px] hover:bg-white/[0.05] transition-colors">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white tracking-tight truncate pr-4">{project.name}</h3>
          <div className="flex items-center gap-2 shrink-0 bg-black/40 px-2 py-1 rounded-md">
            <CircleDot
              size={12}
              className={
                latestDeploy?.status === 'SUCCESS'
                  ? 'text-[#28c840]'
                  : latestDeploy?.status === 'PAUSED'
                  ? 'text-amber-400'
                  : latestDeploy?.status === 'BUILDING'
                  ? 'text-[#febc2e] animate-pulse'
                  : latestDeploy?.status === 'FAILED'
                  ? 'text-[#ff5f57]'
                  : 'text-white/30'
              }
            />
            <span className="text-[10px] font-semibold text-white/70 capitalize uppercase tracking-wider">
              {latestDeploy?.status === 'BUILDING' && currentStage ? 'BUILDING' : latestDeploy?.status?.toLowerCase() || 'PENDING'}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <p className="text-[11px] text-white/60 flex items-center gap-2 font-mono" title={project.repoUrl}>
            <FolderGit2 size={14} className="text-white/40" />
            <span className="truncate">{formatRepoName(project.repoUrl)} <span className="text-white/30">({project.branch})</span></span>
          </p>
          <p className="text-[11px] text-white/60 flex items-center gap-2 font-mono">
            <Server size={14} className="text-blue-500/70" />
            <span className="truncate">{project.server?.name} <span className="text-white/30">({project.server?.publicIp}:{project.port})</span></span>
          </p>
        </div>
        
        {latestDeploy?.status === 'FAILED' && (
          <button
            onClick={() => onOpenDiagnostic(project, latestDeploy)}
            className="bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 text-[11px] text-red-400 px-3 py-2 rounded-md transition-colors flex items-center justify-between w-full mb-4 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span className="truncate">
                Failed: {failedStage ? failedStage.name : 'Unknown Stage'}
              </span>
            </div>
            <ChevronRight size={12} className="text-red-400 shrink-0" />
          </button>
        )}

        {latestDeploy?.status === 'BUILDING' && (
          <button
            onClick={() => onOpenDiagnostic(project, latestDeploy)}
            className="bg-yellow-500/10 hover:bg-yellow-500/20 ring-1 ring-yellow-500/20 text-[11px] text-yellow-400 px-3 py-2 rounded-md transition-colors flex items-center justify-between w-full mb-4 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 truncate">
              <CircleDot size={14} className="text-yellow-500 shrink-0 animate-spin" />
              <span className="truncate">
                Running: {currentStage || 'Initializing'}
              </span>
            </div>
            <ChevronRight size={12} className="text-yellow-400 shrink-0" />
          </button>
        )}

        {latestDeploy?.status === 'PAUSED' && (
          <div className="bg-amber-500/10 ring-1 ring-amber-500/20 text-[11px] text-amber-400 px-3 py-2 rounded-md flex items-center gap-2 w-full mb-4">
            <Pause size={14} className="shrink-0" />
            <span>Application container is paused on target server.</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2.5">
        {/* Primary Action Button */}
        <div className="flex gap-2">
          {latestDeploy?.status === 'SUCCESS' && (
            <>
              <a
                href={`http://${project.server?.publicIp}:${project.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all flex-1 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink size={14} />
                <span>View Site</span>
              </a>

              <button
                onClick={() => onPause(project.id)}
                disabled={pausingId === project.id}
                title="Pause container execution"
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium px-3.5 py-2 rounded-lg ring-1 ring-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Pause size={14} />
                <span>{pausingId === project.id ? 'Pausing...' : 'Pause'}</span>
              </button>
            </>
          )}

          {latestDeploy?.status === 'PAUSED' && (
            <button
              onClick={() => onResume(project.id)}
              disabled={resumingId === project.id}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all flex-1 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Play size={14} className="fill-white" />
              <span>{resumingId === project.id ? 'Resuming...' : 'Resume Application'}</span>
            </button>
          )}

          {(latestDeploy?.status === 'FAILED' || latestDeploy?.status === 'PENDING' || !latestDeploy) && (
            <button 
              onClick={() => onDeploy(project.id)} 
              disabled={latestDeploy?.status === 'BUILDING'}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all flex-1 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Play size={14} />
              <span>Deploy Now</span>
            </button>
          )}
        </div>

        {/* Secondary Toolbar Icons */}
        <div className="flex items-center justify-between bg-black/20 ring-1 ring-white/5 rounded-lg px-2.5 py-1.5 text-white/50">
          <div className="flex items-center gap-1">
            {latestDeploy?.status === 'SUCCESS' && (
              <button
                onClick={() => onRestart(project.id)}
                disabled={restartingId === project.id}
                title="Restart running container"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <RotateCcw size={14} className={restartingId === project.id ? 'animate-spin text-blue-400' : ''} />
              </button>
            )}

            <button 
              onClick={() => onDeploy(project.id)} 
              disabled={latestDeploy?.status === 'BUILDING'}
              title="Rebuild & Redeploy from GitHub"
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Play size={14} />
            </button>

            <button
              onClick={() => onOpenLogs(project.id)}
              title="View Live Terminal Logs"
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <Terminal size={14} />
            </button>
          </div>

          <button
            onClick={() => onDelete(project.id)}
            title="Delete Project"
            className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Main Projects page ─────────────────────────────────────────────────────────
export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDiagnosticDeploy, setSelectedDiagnosticDeploy] = useState<{ project: any; deploy: any } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [restartingId, setRestartingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [serverId, setServerId] = useState('');
  const [port, setPort] = useState('8080');

  const { showToast } = useToastStore();

  // Single useMemo replaces two separate .some() + .find() calls per render
  const portConflict = useMemo(() => {
    const found = projects.find(
      (p) => p.serverId === serverId && p.port === parseInt(port)
    );
    return { isConflicting: !!found, projectName: found?.name ?? null };
  }, [projects, serverId, port]);

  // Stable function references via useCallback — prevents child re-renders
  const formatDuration = useCallback((ms: number | null): string => {
    if (ms === null || ms === undefined) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }, []);

  const formatTime = useCallback((isoString: string | null): string => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, []);

  const formatRepoName = useCallback((url: string): string => {
    if (!url) return '';
    const cleaned = url
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/\.git\/?$/i, '')
      .replace(/\/$/, '');
    const parts = cleaned.split('/');
    return parts[parts.length - 1] || cleaned;
  }, []);

  const getFailedStage = useCallback((deploy: any) => {
    return (deploy?.stages || []).find((s: any) => s.status === 'FAILED');
  }, []);

  const getStageIcon = useCallback((status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-[#28c840] flex-shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-[#ff5f57] flex-shrink-0" />;
      case 'RUNNING':
        return <CircleDot className="w-5 h-5 text-[#febc2e] flex-shrink-0 animate-pulse" />;
      case 'SKIPPED':
        return <HelpCircle className="w-5 h-5 text-white/30 flex-shrink-0" />;
      default:
        return <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 bg-transparent" />;
    }
  }, []);

  const buildDiagnosticText = useCallback((project: any, deploy: any, failedStage: any) => {
    return `SELFHOST DEPLOYMENT DIAGNOSTIC REPORT\n=========================================\nDeployment ID: ${deploy.id}\nProject Name: ${project.name}\nTarget Server: ${project.server?.name || 'N/A'} (${project.server?.publicIp || 'N/A'})\nRepository: ${project.repoUrl} (${project.branch})\nInternal Port: ${project.port}\nTimestamp: ${new Date(deploy.startedAt).toLocaleString()}\nDuration: ${deploy.completedAt ? formatDuration(new Date(deploy.completedAt).getTime() - new Date(deploy.startedAt).getTime()) : 'N/A'}\n\nFAILED STAGE: ${failedStage?.name || 'N/A'}\n-----------------------------------------\nReason: ${failedStage?.errorReason || 'Unknown error occurred'}\nPossible Causes:\n${failedStage?.possibleCauses || '- Unknown'}\nSuggested Fix:\n${failedStage?.suggestedFix || 'Inspect raw logs.'}\n\nSTAGE RUNTIME SUMMARY:\n-----------------------------------------\n${[...(deploy.stages || [])].sort((a: any, b: any) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name)).map((s: any) => `${s.name}: ${s.status} (${s.durationMs ? formatDuration(s.durationMs) : '0s'})`).join('\n')}\n\n=========================================\nGenerated automatically by Selfhost Engine.\n`;
  }, [formatDuration]);

  // AbortController prevents state updates after unmount (memory leak / React warning)
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [projRes, integRes] = await Promise.all([
        api.get('/projects', { signal }),
        api.get('/auth/integrations', { signal }),
      ]);
      setProjects(projRes.data);
      setServers(integRes.data.instances || []);
    } catch (err: any) {
      // AbortError is expected on unmount — don't log it
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    // Stop polling when any modal is open — modals block interaction so
    // polling is pure CPU waste while they're visible.
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !showModal && !selectedProjectId && !selectedDiagnosticDeploy) {
        fetchData(controller.signal);
      }
    }, 4000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(controller.signal);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, showModal, selectedProjectId, selectedDiagnosticDeploy]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId) {
      showToast('Please select a target EC2 server for deployment.', 'error');
      return;
    }
    if (portConflict.isConflicting) {
      showToast(`Port ${port} is already in use by project "${portConflict.projectName}" on this server. Please choose another port.`, 'error');
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
      showToast('Project created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create project', 'error');
    }
  };

  const handleDeploy = useCallback(async (id: string) => {
    try {
      await api.post(`/projects/${id}/deploy`);
      showToast('Deployment triggered!', 'success');
      setSelectedDiagnosticDeploy(null);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Failed to trigger deployment', 'error');
    }
  }, [fetchData, showToast]);

  const handlePause = useCallback(async (id: string) => {
    setPausingId(id);
    try {
      await api.post(`/projects/${id}/pause`);
      showToast('Application deployment paused.', 'info');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to pause deployment', 'error');
    } finally {
      setPausingId(null);
    }
  }, [fetchData, showToast]);

  const handleResume = useCallback(async (id: string) => {
    setResumingId(id);
    try {
      await api.post(`/projects/${id}/resume`);
      showToast('Application resumed successfully!', 'success');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to resume deployment', 'error');
    } finally {
      setResumingId(null);
    }
  }, [fetchData, showToast]);

  const handleRestart = useCallback(async (id: string) => {
    setRestartingId(id);
    try {
      await api.post(`/projects/${id}/restart`);
      showToast('Application restarted successfully!', 'success');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to restart deployment', 'error');
    } finally {
      setRestartingId(null);
    }
  }, [fetchData, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also stop and remove any active containers on the target server.')) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      fetchData();
      showToast('Project deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete project.', 'error');
    }
  }, [fetchData, showToast]);

  const handleOpenDiagnostic = useCallback((project: any, deploy: any) => {
    setSelectedDiagnosticDeploy({ project, deploy });
  }, []);

  const downloadReport = useCallback((project: any, deploy: any) => {
    const failedStage = getFailedStage(deploy);
    const text = buildDiagnosticText(project, deploy, failedStage);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic_report_${project.name}_${deploy.id.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [getFailedStage, buildDiagnosticText]);

  const copyToClipboard = useCallback((project: any, deploy: any) => {
    const failedStage = getFailedStage(deploy);
    const text = buildDiagnosticText(project, deploy, failedStage);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getFailedStage, buildDiagnosticText]);

  // Sorted stage list for the diagnostic panel — memoized to avoid re-sorting on every render
  const sortedDiagnosticStages = useMemo(() => {
    if (!selectedDiagnosticDeploy) return [];
    return [...(selectedDiagnosticDeploy.deploy.stages || [])].sort(
      (a: any, b: any) => STAGE_ORDER.indexOf(a.name) - STAGE_ORDER.indexOf(b.name)
    );
  }, [selectedDiagnosticDeploy]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Deployments</h1>
          <p className="text-xs text-white/50 mt-1">Manage and monitor your application deployments</p>
        </div>
        <button
          onClick={() => {
            if (projects.length >= 10) {
              showToast('you have to delete some of your old projects', 'error');
            }
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        !showModal ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] ring-1 ring-white/5 rounded-xl text-center">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/30 mb-4">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2 tracking-tight">No deployments yet</h3>
            <p className="text-xs text-white/50 mb-6 max-w-sm">
              Link a GitHub repository to a target EC2 server to automate your first deployment pipeline.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
            >
              Add Project
            </button>
          </div>
        ) : null
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              pausingId={pausingId}
              resumingId={resumingId}
              restartingId={restartingId}
              onDeploy={handleDeploy}
              onPause={handlePause}
              onResume={handleResume}
              onRestart={handleRestart}
              onDelete={handleDelete}
              onOpenLogs={setSelectedProjectId}
              onOpenDiagnostic={handleOpenDiagnostic}
              formatRepoName={formatRepoName}
              formatDuration={formatDuration}
              getFailedStage={getFailedStage}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          {projects.length >= 10 ? (
            <div className="bg-[#1a1a1c] border border-white/10 shadow-2xl rounded-2xl w-full max-w-md p-6 text-center animate-fade-up">
              <h3 className="text-lg font-bold text-[#ff5f57] mb-3 flex items-center justify-center gap-2">
                <AlertCircle size={20} />
                <span>Limit Reached</span>
              </h3>
              <p className="text-xs text-white/60 mb-6 leading-relaxed">
                You have reached your limit of 10 active projects. You have to delete some of your old projects to deploy new ones.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium w-full py-2.5 rounded-md transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="bg-[#1a1a1c] border border-white/10 shadow-2xl rounded-2xl w-full max-w-md p-6 animate-fade-up">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <FolderGit2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Link Repository</h3>
                  <p className="text-[10px] text-white/50">Deploy a Git repository to an EC2 instance</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Project Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all" required placeholder="my-awesome-app" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Git URL</label>
                  <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all" placeholder="https://github.com/username/repo" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Branch</label>
                    <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs focus:ring-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Internal Port</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className={`w-full bg-black/20 ring-1 rounded-md px-3 py-2 text-white placeholder-white/30 text-xs outline-none transition-all ${portConflict.isConflicting ? 'ring-red-500 focus:ring-red-500' : 'ring-white/10 focus:ring-blue-500'}`}
                      required
                    />
                    {portConflict.isConflicting && (
                      <p className="text-[9px] text-red-400 mt-1 font-semibold">
                        ⚠️ Port in use
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Target Server</label>
                  <select
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    className="w-full bg-black/20 ring-1 ring-white/10 rounded-md px-3 py-2 text-white text-xs focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#1a1a1c]">Select EC2 Instance</option>
                    {servers.map((s) => {
                      const takenPorts = projects.filter((p) => p.serverId === s.id).map((p) => p.port);
                      const portsLabel = takenPorts.length > 0 ? ` (Used: ${takenPorts.join(',')})` : '';
                      return (
                        <option key={s.id} value={s.id} className="bg-[#1a1a1c]">{s.name} ({s.publicIp}){portsLabel}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 rounded-md ring-1 ring-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={portConflict.isConflicting} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-xs font-medium py-2.5 rounded-md transition-colors">Create Deployment</button>
              </div>
            </form>
          )}
        </div>
      )}

      {selectedProjectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1c] border border-white/10 shadow-2xl rounded-2xl w-full max-w-2xl p-6 flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="text-white/40" size={16} />
                Build Logs
              </h3>
              <button onClick={() => setSelectedProjectId(null)} className="text-white/40 hover:text-white transition-colors">
                <XCircle size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden bg-black/50 rounded-xl border border-white/5">
              <LogTerminal 
                projectId={selectedProjectId} 
                initialStages={projects.find(p => p.id === selectedProjectId)?.deployments?.[0]?.stages || []} 
              />
            </div>
          </div>
        </div>
      )}

      {selectedDiagnosticDeploy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#1a1a1c] border border-white/10 shadow-2xl rounded-2xl w-full max-w-4xl p-6 my-8 animate-fade-up">
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="text-blue-500" size={18} />
                  Pipeline Diagnostics
                </h3>
                <p className="text-[10px] text-white/50 mt-1 font-mono">
                  Deploy ID: {selectedDiagnosticDeploy.deploy.id} | Project: {selectedDiagnosticDeploy.project.name}
                </p>
              </div>
              <button onClick={() => setSelectedDiagnosticDeploy(null)} className="text-white/40 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Timeline Column */}
              <div className="md:col-span-5 bg-white/[0.02] ring-1 ring-white/5 p-5 rounded-xl">
                <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-4 border-b border-white/5 pb-2">
                  Execution Timeline
                </h4>
                <div className="relative border-l border-white/10 ml-3 pl-6 space-y-5">
                  {sortedDiagnosticStages.map((stage: any) => (
                    <div key={stage.id} className="relative">
                      <span className="absolute -left-[35px] top-0 bg-[#1a1a1c] p-0.5 rounded-full z-10 border border-white/10">
                        {getStageIcon(stage.status)}
                      </span>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-semibold ${stage.status === 'RUNNING' ? 'text-[#febc2e]' : stage.status === 'FAILED' ? 'text-[#ff5f57]' : stage.status === 'SUCCESS' ? 'text-[#28c840]' : 'text-white/40'}`}>
                          {stage.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-white/30 font-mono">
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
                  <div className="flex-1 bg-white/[0.02] ring-1 ring-white/5 border-l-4 border-l-[#ff5f57] p-5 rounded-xl space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#ff5f57] leading-tight">
                          {getFailedStage(selectedDiagnosticDeploy.deploy)?.errorReason || 'Deployment Failed'}
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono mt-1">
                          Stage: {getFailedStage(selectedDiagnosticDeploy.deploy)?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 block">Possible Causes</span>
                      <div className="bg-black/30 ring-1 ring-white/5 p-3 rounded-lg text-[11px] text-white/70 whitespace-pre-line leading-relaxed">
                        {getFailedStage(selectedDiagnosticDeploy.deploy)?.possibleCauses || 'Check the build logs for specific exit codes.'}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 block">Suggested Fix</span>
                      <div className="bg-blue-500/10 ring-1 ring-blue-500/20 p-3 rounded-lg text-[11px] text-blue-200 font-medium leading-relaxed">
                        {getFailedStage(selectedDiagnosticDeploy.deploy)?.suggestedFix || 'Review the configuration and attempt deployment again.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-white/[0.02] ring-1 ring-white/5 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                    <CircleDot className="w-8 h-8 text-[#febc2e] animate-spin" />
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Deployment Running</h4>
                      <p className="text-[11px] text-white/50 mt-1 max-w-xs">
                        The pipeline is executing on the target infrastructure.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white/[0.02] ring-1 ring-white/5 p-4 rounded-xl flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => downloadReport(selectedDiagnosticDeploy.project, selectedDiagnosticDeploy.deploy)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium py-2 rounded-md ring-1 ring-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={13} /> Report
                  </button>
                  <button
                    onClick={() => copyToClipboard(selectedDiagnosticDeploy.project, selectedDiagnosticDeploy.deploy)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium py-2 rounded-md ring-1 ring-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={13} className="text-[#28c840]" /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  {selectedDiagnosticDeploy.deploy.status === 'FAILED' && (
                    <button
                      onClick={() => handleDeploy(selectedDiagnosticDeploy.project.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={13} /> Retry
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
