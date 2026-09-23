import React from 'react';
import { Bot, ExternalLink, ShieldCheck, Radio } from 'lucide-react';
import { DiscordBot } from '../types';

interface NavbarProps {
  bot: DiscordBot | null;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ bot, onDisconnect }) => {
  return (
    <header className="border-b border-zinc-800 bg-[#1e1f22]/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Discord Bot Messenger
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
                Dashboard
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Diffusez des messages et annonces sur vos serveurs Discord
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors border border-zinc-700/50"
          >
            <span>Developer Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>

          {bot ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/60 rounded-xl p-1.5 pr-3">
              <img
                src={bot.avatarUrl}
                alt={bot.username}
                className="w-8 h-8 rounded-full border border-[#5865F2]/50 object-cover"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-xs font-semibold text-white">
                  <span>{bot.global_name || bot.username}</span>
                  <span className="text-[10px] bg-[#5865F2] text-white px-1 rounded font-bold">BOT</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>En ligne</span>
                </div>
              </div>
              <button
                onClick={onDisconnect}
                className="ml-2 text-xs text-zinc-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-zinc-800"
                title="Déconnecter le bot"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aucun bot connecté</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
