import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BotConfigStep } from './components/BotConfigStep';
import { BotInviteCard } from './components/BotInviteCard';
import { ServerChannelSelector } from './components/ServerChannelSelector';
import { MessageComposer } from './components/MessageComposer';
import { MessageHistory } from './components/MessageHistory';
import { DiscordBot, DiscordGuild, DiscordChannel, DiscordCategory, EmbedConfig, SentMessageLog } from './types';
import { Info, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('discord_bot_token') || '';
  });
  const [bot, setBot] = useState<DiscordBot | null>(null);
  const [isLoadingBot, setIsLoadingBot] = useState<boolean>(false);
  const [botError, setBotError] = useState<string | null>(null);

  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [isRefreshingGuilds, setIsRefreshingGuilds] = useState<boolean>(false);
  const [selectedGuild, setSelectedGuild] = useState<DiscordGuild | null>(null);

  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [categories, setCategories] = useState<DiscordCategory[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<DiscordChannel | null>(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [channelError, setChannelError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [logs, setLogs] = useState<SentMessageLog[]>(() => {
    try {
      const saved = localStorage.getItem('discord_message_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('discord_message_logs', JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Fetch servers where bot is present
  const fetchGuilds = async (authToken: string) => {
    setIsRefreshingGuilds(true);
    try {
      const res = await fetch('/api/discord/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des serveurs');
      }

      const guildList: DiscordGuild[] = data.guilds || [];
      setGuilds(guildList);

      // Auto-select first guild if available and none selected
      if (guildList.length > 0) {
        setSelectedGuild((prev) => {
          if (prev && guildList.some((g) => g.id === prev.id)) {
            return prev;
          }
          return guildList[0];
        });
      } else {
        setSelectedGuild(null);
        setChannels([]);
        setSelectedChannel(null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRefreshingGuilds(false);
    }
  };

  // Fetch channels for a guild
  const fetchChannels = async (guildId: string, authToken: string) => {
    setIsLoadingChannels(true);
    setChannelError(null);
    try {
      const res = await fetch(`/api/discord/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossible de récupérer les salons.');
      }

      const fetchedChannels: DiscordChannel[] = data.channels || [];
      const fetchedCategories: DiscordCategory[] = data.categories || [];
      setChannels(fetchedChannels);
      setCategories(fetchedCategories);

      // Auto-select first channel
      if (fetchedChannels.length > 0) {
        setSelectedChannel(fetchedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (err: any) {
      setChannelError(err.message || 'Erreur lors de la récupération des salons.');
      setChannels([]);
      setSelectedChannel(null);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Whenever selected guild changes, load channels
  useEffect(() => {
    if (selectedGuild && token && bot) {
      fetchChannels(selectedGuild.id, token);
    }
  }, [selectedGuild?.id]);

  // Connect & Verify Bot
  const handleVerify = async () => {
    if (!token.trim()) return;
    setIsLoadingBot(true);
    setBotError(null);

    try {
      const res = await fetch('/api/discord/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Impossible de vérifier ce token.');
      }

      setBot(data);
      localStorage.setItem('discord_bot_token', token.trim());
      await fetchGuilds(token.trim());
    } catch (err: any) {
      setBotError(err.message || 'Erreur de connexion au bot.');
      setBot(null);
    } finally {
      setIsLoadingBot(false);
    }
  };

  // Disconnect Bot
  const handleDisconnect = () => {
    setBot(null);
    setSelectedGuild(null);
    setSelectedChannel(null);
    setGuilds([]);
    setChannels([]);
    localStorage.removeItem('discord_bot_token');
  };

  // Send message
  const handleSendMessage = async (
    content: string,
    embed?: EmbedConfig
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!selectedChannel || !token) {
      return { success: false, error: 'Salon ou token manquant.' };
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/discord/channels/${selectedChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          content,
          embed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || "Échec lors de l'envoi du message.";
        const newLog: SentMessageLog = {
          id: Math.random().toString(36).substring(2, 9),
          channelId: selectedChannel.id,
          channelName: selectedChannel.name,
          guildId: selectedGuild ? selectedGuild.id : '',
          guildName: selectedGuild ? selectedGuild.name : 'Inconnu',
          content,
          embed,
          timestamp: new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date()),
          status: 'failed',
          errorMessage: errorMsg,
        };
        setLogs((prev) => [newLog, ...prev]);
        return { success: false, error: errorMsg };
      }

      const newLog: SentMessageLog = {
        id: Math.random().toString(36).substring(2, 9),
        messageId: data.messageId,
        channelId: selectedChannel.id,
        channelName: selectedChannel.name,
        guildId: selectedGuild ? selectedGuild.id : '',
        guildName: selectedGuild ? selectedGuild.name : 'Inconnu',
        content,
        embed,
        timestamp: new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
        status: 'success',
      };
      setLogs((prev) => [newLog, ...prev]);

      return { success: true, messageId: data.messageId };
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur réseau inattendue.';
      return { success: false, error: errorMsg };
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-zinc-100 flex flex-col font-sans selection:bg-[#5865F2] selection:text-white">
      <Navbar bot={bot} onDisconnect={handleDisconnect} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner introduction */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5865F2]/20 via-[#5865F2]/10 to-transparent border border-[#5865F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5865F2] flex items-center justify-center shrink-0 shadow-md shadow-[#5865F2]/30 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Gestionnaire de Messages pour Bot Discord
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Connectez votre bot, ajoutez-le sur votre serveur et publiez instantanément vos annonces et messages textuels dans les salons autorisés.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conforme API Discord v10</span>
          </div>
        </div>

        {/* Step 1: Connect Bot */}
        {!bot ? (
          <BotConfigStep
            token={token}
            setToken={setToken}
            onVerify={handleVerify}
            isLoading={isLoadingBot}
            error={botError}
          />
        ) : (
          <div className="space-y-8 animate-in fade-in">
            {/* Bot Profile & Invitation link */}
            <BotInviteCard
              bot={bot}
              serverCount={guilds.length}
              isRefreshingGuilds={isRefreshingGuilds}
              onRefreshGuilds={() => fetchGuilds(token)}
            />

            {/* Server & Channel Selection */}
            <ServerChannelSelector
              guilds={guilds}
              selectedGuild={selectedGuild}
              onSelectGuild={(guild) => setSelectedGuild(guild)}
              channels={channels}
              categories={categories}
              selectedChannel={selectedChannel}
              onSelectChannel={(channel) => setSelectedChannel(channel)}
              isLoadingChannels={isLoadingChannels}
              channelError={channelError}
              onRefreshChannels={() => selectedGuild && fetchChannels(selectedGuild.id, token)}
            />

            {/* Message Composer & Live Preview */}
            <MessageComposer
              bot={bot}
              selectedGuild={selectedGuild}
              selectedChannel={selectedChannel}
              onSendMessage={handleSendMessage}
              isSending={isSending}
            />

            {/* History of sent messages */}
            <MessageHistory logs={logs} onClear={() => setLogs([])} />
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 bg-[#1e1f22] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Discord Bot Messenger • Conforme aux conditions d'utilisation Discord</span>
          <span className="text-zinc-600">Pour administrer et animer vos serveurs en toute sécurité</span>
        </div>
      </footer>
    </div>
  );
}
