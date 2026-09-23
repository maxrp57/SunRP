import React from 'react';
import { History, CheckCircle2, XCircle, Trash2, Hash, ArrowUpRight } from 'lucide-react';
import { SentMessageLog } from '../types';

interface MessageHistoryProps {
  logs: SentMessageLog[];
  onClear: () => void;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({ logs, onClear }) => {
  if (logs.length === 0) return null;

  return (
    <div className="bg-[#2b2d31] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5865F2]" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Historique des messages envoyés ({logs.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Effacer l'historique</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 rounded-xl bg-[#1e1f22] border border-zinc-800 text-xs flex items-start justify-between gap-3"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate">{log.guildName}</span>
                <span className="text-zinc-500">•</span>
                <span className="flex items-center gap-1 text-[#5865F2] font-medium">
                  <Hash className="w-3 h-3" />
                  {log.channelName}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400 text-[11px]">{log.timestamp}</span>
              </div>

              {log.content && (
                <p className="text-zinc-300 truncate font-mono text-[11px] bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
                  {log.content}
                </p>
              )}

              {log.embed && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: log.embed.color }} />
                  <span>Embed : {log.embed.title || 'Sans titre'}</span>
                </div>
              )}

              {log.errorMessage && (
                <p className="text-red-400 text-[11px]">{log.errorMessage}</p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
              {log.status === 'success' ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Délivré</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  <XCircle className="w-3 h-3" />
                  <span>Échec</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
