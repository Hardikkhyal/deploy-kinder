import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, PlayCircle, HelpCircle } from 'lucide-react';

interface Stage {
  name: string;
  status: string;
  logs: string;
}

interface LogTerminalProps {
  projectId: string;
  initialStages: Stage[];
}

// Shared constant — defined once at module level, not inside component
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

export default function LogTerminal({ projectId, initialStages }: LogTerminalProps) {
  const [stageLogs, setStageLogs] = useState<{ [key: string]: string[] }>(() => {
    const initial: { [key: string]: string[] } = {};
    initialStages.forEach((s) => {
      initial[s.name] = s.logs ? s.logs.split('\n').filter(Boolean) : [];
    });
    return initial;
  });

  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [expandedStages, setExpandedStages] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    initialStages.forEach((s) => {
      initial[s.name] = s.status === 'RUNNING' || s.status === 'FAILED';
    });
    return initial;
  });

  const consoleBottomRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const logQueueRef = useRef<{ [key: string]: string[] }>({});
  const hasUpdatesRef = useRef<boolean>(false);
  // Track which stage is currently active so we can scroll only that one
  const activeStageRef = useRef<string | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';
    const socket = io(wsUrl);

    socket.emit('join-container-logs', projectId);

    const flushInterval = setInterval(() => {
      if (!hasUpdatesRef.current) return;

      setStageLogs((prev) => {
        const next = { ...prev };
        let modified = false;
        Object.keys(logQueueRef.current).forEach((stage) => {
          const queued = logQueueRef.current[stage];
          if (queued && queued.length > 0) {
            next[stage] = [...(next[stage] || []), ...queued];
            logQueueRef.current[stage] = [];
            modified = true;
          }
        });
        return modified ? next : prev;
      });

      hasUpdatesRef.current = false;
    }, 150);

    socket.on('log-line', (data: any) => {
      let stage = 'General';
      let text = '';
      if (data && typeof data === 'object') {
        stage = data.stage;
        text = data.text;
      } else if (typeof data === 'string') {
        const match = data.match(/^\[([^\]]+)\] (.*)$/);
        if (match) {
          stage = match[1];
          text = match[2];
        } else {
          text = data;
        }
      }

      if (!logQueueRef.current[stage]) {
        logQueueRef.current[stage] = [];
      }
      logQueueRef.current[stage].push(text);
      hasUpdatesRef.current = true;
      activeStageRef.current = stage;

      setExpandedStages((prev) => {
        if (prev[stage]) return prev;
        return { ...prev, [stage]: true };
      });
    });

    socket.on('stage-update', (data: { stage: string; status: string; error?: any }) => {
      setStages((prev) => {
        const updated = prev.map((s) => {
          if (s.name === data.stage) {
            return { ...s, status: data.status };
          }
          return s;
        });

        if (!updated.some((s) => s.name === data.stage)) {
          updated.push({ name: data.stage, status: data.status, logs: '' });
        }

        return updated;
      });

      if (data.status === 'RUNNING' || data.status === 'FAILED') {
        activeStageRef.current = data.stage;
        setExpandedStages((prev) => ({
          ...prev,
          [data.stage]: true
        }));
      }
    });

    return () => {
      socket.disconnect();
      clearInterval(flushInterval);
    };
  }, [projectId]);

  // Scroll only the single active/most-recently-updated stage to bottom.
  // Previously this looped through ALL expanded stages on every log update —
  // O(n) DOM queries per 150ms flush tick. Now it's O(1).
  useEffect(() => {
    const active = activeStageRef.current;
    if (active && expandedStages[active]) {
      consoleBottomRefs.current[active]?.scrollIntoView({ behavior: 'auto' });
    }
  }, [stageLogs, expandedStages]);

  // useCallback: stable identity prevents row-level re-renders
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="text-emerald-500 w-4 h-4 flex-shrink-0" />;
      case 'FAILED':
        return <XCircle className="text-red-500 w-4 h-4 flex-shrink-0 animate-pulse" />;
      case 'RUNNING':
        return <PlayCircle className="text-amber-500 w-4 h-4 flex-shrink-0 animate-spin" />;
      case 'SKIPPED':
        return <HelpCircle className="text-neutral-400 w-4 h-4 flex-shrink-0" />;
      default:
        return <div className="w-4 h-4 rounded-full border border-neutral-200 flex-shrink-0 bg-white" />;
    }
  }, []);

  const toggleStage = useCallback((stageName: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageName]: !prev[stageName]
    }));
  }, []);

  // useMemo: the array spread + sort was running on every single render tick.
  // Now it only recomputes when the stages array reference changes.
  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => {
      const idxA = STAGE_ORDER.indexOf(a.name);
      const idxB = STAGE_ORDER.indexOf(b.name);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [stages]);

  return (
    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      {sortedStages.map((stage) => {
        const isExpanded = expandedStages[stage.name];
        const logs = stageLogs[stage.name] || [];
        
        return (
          <div key={stage.name} className="bg-bg-soft soft-shadow-small rounded-[16px] overflow-hidden">
            <button
              onClick={() => toggleStage(stage.name)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-bg-soft hover:soft-shadow-inset transition-all text-left font-sans cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(stage.status)}
                <span className={`text-xs font-semibold ${stage.status === 'RUNNING' ? 'text-amber-600 font-bold' : stage.status === 'FAILED' ? 'text-red-650 dark:text-red-400 font-bold' : 'text-text-soft'}`}>
                  {stage.name}
                </span>
                {logs.length > 0 && (
                  <span className="text-[10px] text-neutral-500 bg-bg-soft soft-shadow-inset px-2 py-0.5 rounded-[8px] font-mono font-medium">
                    {logs.length} lines
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold">
                  {stage.status.toLowerCase()}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-neutral-200/20 dark:border-neutral-800/20 bg-[#1E1E1E] p-4 font-mono text-[11px] text-neutral-100 max-h-64 overflow-y-auto shadow-inner rounded-b-[16px] relative">
                {logs.length === 0 ? (
                  <div className="text-neutral-500 italic">No logs generated for this stage yet.</div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap leading-relaxed border-l border-neutral-800 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
                <div ref={(el) => { consoleBottomRefs.current[stage.name] = el; }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
