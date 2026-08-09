import { useToastStore } from '../store/toastStore';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { message, type } = useToastStore();

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md ${
        type === 'success' ? 'bg-[#28c840]/10 border-[#28c840]/20 text-[#28c840]' :
        type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
        'bg-blue-500/10 border-blue-500/20 text-blue-400'
      }`}>
        {type === 'success' && <CheckCircle2 size={16} />}
        {type === 'error' && <XCircle size={16} />}
        {type === 'info' && <Info size={16} />}
        <span className="text-xs font-semibold">{message}</span>
      </div>
    </div>
  );
}
