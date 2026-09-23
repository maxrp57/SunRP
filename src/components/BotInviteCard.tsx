import React, { useState } from 'react';
import { UserPlus, Copy, Check, ExternalLink, ShieldCheck, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { DiscordBot } from '../types';

interface BotInviteCardProps {
  bot: DiscordBot;
  onRefreshGuilds: () => void;
  isRefreshingGuilds: boolean;
  serverCount: number;
}

export const BotInviteCard: React.FC<BotInviteCardProps> = ({
  bot,
  onRefreshGuilds,
  isRefreshingGuilds,
  serverCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [useAdmin, setUseAdmin] = useState(false);

  // Standard permissions: View Channels (1024), Send Messages (2048), Embed Links (16384), Attach Files (32768), Read Message History (65536)
  // Sum = 117760
  // Administrator = 8
  const permissions = useAdmin ? '8' : '117760';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${bot.id}&permissions=${permissions}&scope=bot%20applications.commands`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#2b2d31] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={bot.avatarUrl}
              alt={bot.username}
              className="w-14 h-14 rounded-2xl border-2 border-[#5865F2] shadow-md object-cover bg-zinc-900"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#2b2d31]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {bot.global_name || bot.username}
              </h3>
              <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-bold">
                BOT
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              ID: {bot.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshGuilds}
            disabled={isRefreshingGuilds}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1f22] hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700/60 transition-colors disabled:opacity-50"
            title="Rafraîchir les serveurs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGuilds ? 'animate-spin text-[#5865F2]' : 'text-zinc-400'}`} />
            <span>Actualiser les serveurs ({serverCount})</span>
          </button>
        </div>
      </div>

      <div className="bg-[#1e1f22] border border-zinc-700/60 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#5865F2]" />
            <h4 className="text-sm font-semibold text-white">
              Inviter le bot sur votre serveur
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Permissions :</span>
            <button
              type="button"
              onClick={() => setUseAdmin(false)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                !useAdmin
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Recommandées
            </button>
            <button
              type="button"
              onClick={() => setUseAdmin(true)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                useAdmin
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Administrateur
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          Si votre bot n'est pas encore présent sur votre serveur Discord, utilisez ce lien officiel d'autorisation pour l'ajouter en un clic avec les permissions d'écriture.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="flex-1 bg-zinc-950/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono truncate select-all">
            {inviteUrl}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copier</span>
                </>
              )}
            </button>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold shadow-md shadow-[#5865F2]/20 transition-all"
            >
              <span>Ajouter au serveur</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
