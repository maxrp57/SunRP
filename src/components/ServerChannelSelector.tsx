import React, { useState, useMemo } from 'react';
import { Server, Hash, Megaphone, Search, Folder, ChevronRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { DiscordGuild, DiscordChannel, DiscordCategory } from '../types';

interface ServerChannelSelectorProps {
  guilds: DiscordGuild[];
  selectedGuild: DiscordGuild | null;
  onSelectGuild: (guild: DiscordGuild) => void;
  channels: DiscordChannel[];
  categories: DiscordCategory[];
  selectedChannel: DiscordChannel | null;
  onSelectChannel: (channel: DiscordChannel) => void;
  isLoadingChannels: boolean;
  channelError: string | null;
  onRefreshChannels: () => void;
}

export const ServerChannelSelector: React.FC<ServerChannelSelectorProps> = ({
  guilds,
  selectedGuild,
  onSelectGuild,
  channels,
  categories,
  selectedChannel,
  onSelectChannel,
  isLoadingChannels,
  channelError,
  onRefreshChannels,
}) => {
  const [channelSearch, setChannelSearch] = useState('');

  // Group channels by category
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels;
    const q = channelSearch.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  }, [channels, channelSearch]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const groupedChannels = useMemo(() => {
    const uncategorized: DiscordChannel[] = [];
    const grouped: { [catId: string]: { name: string; channels: DiscordChannel[] } } = {};

    filteredChannels.forEach((ch) => {
      if (ch.parentId && categoryMap.has(ch.parentId)) {
        if (!grouped[ch.parentId]) {
          grouped[ch.parentId] = {
            name: categoryMap.get(ch.parentId)!,
            channels: [],
          };
        }
        grouped[ch.parentId].channels.push(ch);
      } else {
        uncategorized.push(ch);
      }
    });

    return { grouped, uncategorized };
  }, [filteredChannels, categoryMap]);

  return (
    <div className="bg-[#2b2d31] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-xs font-semibold mb-2">
          <span>Étape 2 & 3</span>
          <span>•</span>
          <span>Cible de diffusion</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Sélectionnez le Serveur & le Salon
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Choisissez le serveur où votre bot est installé, puis le salon textuel où diffuser votre message.
        </p>
      </div>

      {/* Guild Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>Serveurs disponibles ({guilds.length})</span>
          </label>
        </div>

        {guilds.length === 0 ? (
          <div className="p-5 rounded-xl bg-[#1e1f22] border border-zinc-800 text-center space-y-2">
            <p className="text-sm text-zinc-300 font-medium">
              Le bot n'a pas encore rejoint de serveur Discord.
            </p>
            <p className="text-xs text-zinc-400">
              Utilisez le bouton "Ajouter au serveur" ci-dessus pour inviter votre bot sur votre Discord, puis cliquez sur "Actualiser".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {guilds.map((guild) => {
              const isSelected = selectedGuild?.id === guild.id;
              return (
                <button
                  key={guild.id}
                  type="button"
                  onClick={() => onSelectGuild(guild)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#5865F2]/15 border-[#5865F2] text-white shadow-md shadow-[#5865F2]/10'
                      : 'bg-[#1e1f22] border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-[#232428]'
                  }`}
                >
                  {guild.iconUrl ? (
                    <img
                      src={guild.iconUrl}
                      alt={guild.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0 border border-zinc-700">
                      {guild.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-white">{guild.name}</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">ID: {guild.id}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#5865F2] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Channels section */}
      {selectedGuild && (
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Salons de {selectedGuild.name}</span>
              </label>
              <button
                onClick={onRefreshChannels}
                disabled={isLoadingChannels}
                className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
                title="Actualiser les salons"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChannels ? 'animate-spin text-[#5865F2]' : ''}`} />
              </button>
            </div>

            {channels.length > 5 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Rechercher un salon..."
                  className="w-full bg-[#1e1f22] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-zinc-700/60 focus:outline-none focus:border-[#5865F2]"
                />
              </div>
            )}
          </div>

          {channelError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{channelError}</p>
            </div>
          )}

          {isLoadingChannels ? (
            <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#5865F2]" />
              <span>Chargement des salons du serveur...</span>
            </div>
          ) : channels.length === 0 && !channelError ? (
            <div className="p-4 rounded-xl bg-[#1e1f22] text-center text-xs text-zinc-400">
              Aucun salon textuel accessible trouvé pour ce serveur.
            </div>
          ) : (
            <div className="bg-[#1e1f22] border border-zinc-800 rounded-xl p-3 max-h-72 overflow-y-auto space-y-4">
              {/* Uncategorized channels */}
              {groupedChannels.uncategorized.length > 0 && (
                <div className="space-y-1">
                  {groupedChannels.uncategorized.map((channel) => {
                    const isSelected = selectedChannel?.id === channel.id;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => onSelectChannel(channel)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-[#5865F2] text-white font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {channel.type === 'announcement' ? (
                            <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          ) : (
                            <Hash className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          )}
                          <span className="truncate">{channel.name}</span>
                        </div>
                        {isSelected && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Actif</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Categorized channels */}
              {Object.entries(groupedChannels.grouped).map(([catId, catData]) => (
                <div key={catId} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <Folder className="w-3 h-3 text-zinc-600" />
                    <span className="truncate">{catData.name}</span>
                  </div>
                  {catData.channels.map((channel) => {
                    const isSelected = selectedChannel?.id === channel.id;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => onSelectChannel(channel)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                          isSelected
                            ? 'bg-[#5865F2] text-white font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {channel.type === 'announcement' ? (
                            <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          ) : (
                            <Hash className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          )}
                          <span className="truncate">{channel.name}</span>
                          {channel.topic && (
                            <span className="text-[10px] text-zinc-500 font-normal truncate max-w-xs">
                              - {channel.topic}
                            </span>
                          )}
                        </div>
                        {isSelected && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Actif</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {selectedChannel && (
            <div className="p-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl flex items-center justify-between text-xs text-[#5865F2]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Salon sélectionné : <strong>#{selectedChannel.name}</strong> sur <strong>{selectedGuild.name}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80">ID: {selectedChannel.id}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
