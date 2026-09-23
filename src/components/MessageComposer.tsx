import React, { useState } from 'react';
import { Send, Sparkles, Sliders, Palette, Clock, User, AlertCircle, CheckCircle2, Loader2, MessageSquare, Flame } from 'lucide-react';
import { DiscordBot, DiscordChannel, DiscordGuild, EmbedConfig } from '../types';

interface MessageComposerProps {
  bot: DiscordBot;
  selectedGuild: DiscordGuild | null;
  selectedChannel: DiscordChannel | null;
  onSendMessage: (content: string, embed?: EmbedConfig) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  isSending: boolean;
}

const DEFAULT_EMBED: EmbedConfig = {
  title: '📢 Annonce officielle',
  description: 'Bienvenue sur notre serveur Discord ! N\'hésitez pas à lire les règles et à vous présenter.',
  color: '#5865F2',
  authorName: '',
  footerText: 'Message diffusé via Discord Bot Messenger',
  includeTimestamp: true,
};

const COLOR_PRESETS = [
  { name: 'Blurple', value: '#5865F2' },
  { name: 'Vert Émeraude', value: '#57F287' },
  { name: 'Jaune Or', value: '#FEE75C' },
  { name: 'Fuchsia', value: '#EB459E' },
  { name: 'Rouge Corail', value: '#ED4245' },
  { name: 'Blanc Neige', value: '#FFFFFF' },
  { name: 'Noir Nuit', value: '#23272A' },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  bot,
  selectedGuild,
  selectedChannel,
  onSendMessage,
  isSending,
}) => {
  const [content, setContent] = useState('');
  const [showEmbed, setShowEmbed] = useState(false);
  const [embed, setEmbed] = useState<EmbedConfig>(DEFAULT_EMBED);
  const [result, setResult] = useState<{ success: boolean; messageId?: string; error?: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannel) return;
    if (!content.trim() && (!showEmbed || (!embed.title && !embed.description))) return;

    setResult(null);
    const res = await onSendMessage(content, showEmbed ? embed : undefined);
    setResult(res);

    if (res.success) {
      setContent('');
    }
  };

  const applyTemplate = (type: 'welcome' | 'rules' | 'update' | 'custom') => {
    if (type === 'welcome') {
      setContent('👋 Bienvenue à tous les nouveaux membres !');
      setShowEmbed(true);
      setEmbed({
        title: '🎉 Bienvenue sur ' + (selectedGuild ? selectedGuild.name : 'le serveur'),
        description: 'Nous sommes ravis de vous accueillir parmi nous ! Prenez quelques secondes pour choisir vos rôles et explorer les différents salons de discussion.',
        color: '#57F287',
        authorName: selectedGuild ? selectedGuild.name : bot.username,
        footerText: 'L\'équipe de modération',
        includeTimestamp: true,
      });
    } else if (type === 'rules') {
      setContent('📜 Rappel important concernant le règlement :');
      setShowEmbed(true);
      setEmbed({
        title: '⚖️ Règles de vie du serveur',
        description: '1. Respectez les autres membres et faites preuve de bienveillance.\n2. Aucun spam, publicité non sollicitée ou contenu offensant.\n3. Utilisez les salons adaptés à chaque sujet.',
        color: '#ED4245',
        authorName: 'Règlement Officiel',
        footerText: 'Toute infraction fera l\'objet d\'un avertissement',
        includeTimestamp: true,
      });
    } else if (type === 'update') {
      setContent('🚀 **Mise à jour disponible !**');
      setShowEmbed(true);
      setEmbed({
        title: '✨ Note de version & Nouveautés',
        description: 'De nouvelles fonctionnalités viennent d\'être déployées sur notre serveur ! Découvrez dès maintenant les nouveaux salons et événements à venir.',
        color: '#5865F2',
        authorName: 'Équipe Développeur',
        footerText: 'Version 1.0 • Merci pour votre soutien',
        includeTimestamp: true,
      });
    }
  };

  const currentTimeFormatted = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return (
    <div className="bg-[#2b2d31] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-xs font-semibold mb-2">
          <span>Étape 4</span>
          <span>•</span>
          <span>Rédaction & Envoi</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Composer le Message
          </h2>
          {selectedChannel ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700/60 rounded-xl text-xs text-zinc-300">
              <span className="text-zinc-500">Destination :</span>
              <span className="text-white font-semibold">#{selectedChannel.name}</span>
            </div>
          ) : (
            <div className="text-xs text-amber-400">
              Veuillez sélectionner un salon ci-dessus avant d'envoyer
            </div>
          )}
        </div>
      </div>

      {/* Templates buttons */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-zinc-400 font-medium">Modèles rapides :</span>
        <button
          type="button"
          onClick={() => applyTemplate('welcome')}
          className="px-2.5 py-1 rounded-lg bg-[#1e1f22] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
        >
          🎉 Bienvenue
        </button>
        <button
          type="button"
          onClick={() => applyTemplate('rules')}
          className="px-2.5 py-1 rounded-lg bg-[#1e1f22] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
        >
          ⚖️ Règles
        </button>
        <button
          type="button"
          onClick={() => applyTemplate('update')}
          className="px-2.5 py-1 rounded-lg bg-[#1e1f22] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
        >
          🚀 Nouveautés
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Message Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Texte du message
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' @everyone ')}
                className="text-[11px] text-[#5865F2] hover:underline"
              >
                + @everyone
              </button>
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' @here ')}
                className="text-[11px] text-[#5865F2] hover:underline"
              >
                + @here
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Écrivez le message que votre bot va poster (supporte le Markdown Discord : **gras**, *italique*, `code`)..."
            className="w-full bg-[#1e1f22] text-white text-sm rounded-xl p-3.5 border border-zinc-700/70 focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/20 transition-all placeholder:text-zinc-600 resize-y"
          />
        </div>

        {/* Toggle Rich Embed */}
        <div className="pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5865F2]" />
              <span className="text-sm font-semibold text-white">
                Intégration d'un Embed riche (Discord Embed)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowEmbed(!showEmbed)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showEmbed ? 'bg-[#5865F2]' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showEmbed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showEmbed && (
            <div className="mt-4 p-4 rounded-xl bg-[#1e1f22] border border-zinc-700/60 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Titre de l'Embed
                  </label>
                  <input
                    type="text"
                    value={embed.title}
                    onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
                    placeholder="ex: Annonce Importante"
                    className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nom de l'auteur (haut de l'embed)
                  </label>
                  <input
                    type="text"
                    value={embed.authorName}
                    onChange={(e) => setEmbed({ ...embed, authorName: e.target.value })}
                    placeholder="ex: Staff / Administration"
                    className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Description / Corps de l'Embed
                </label>
                <textarea
                  value={embed.description}
                  onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
                  rows={3}
                  placeholder="Texte détaillé de l'embed..."
                  className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Couleur de la bordure</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setEmbed({ ...embed, color: p.value })}
                      className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                        embed.color.toLowerCase() === p.value.toLowerCase()
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: p.value }}
                      title={p.name}
                    />
                  ))}
                  <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-700">
                    <input
                      type="color"
                      value={embed.color}
                      onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-300 font-mono">{embed.color}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Texte du pied de page (Footer)
                  </label>
                  <input
                    type="text"
                    value={embed.footerText}
                    onChange={(e) => setEmbed({ ...embed, footerText: e.target.value })}
                    placeholder="ex: Serveur Discord • Tous droits réservés"
                    className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#5865F2]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="timestampCheck"
                    checked={embed.includeTimestamp}
                    onChange={(e) => setEmbed({ ...embed, includeTimestamp: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700 text-[#5865F2] focus:ring-0"
                  />
                  <label htmlFor="timestampCheck" className="text-xs text-zinc-300 cursor-pointer flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Afficher l'heure actuelle dans le footer</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discord Live Preview */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5865F2]" />
            <span>Aperçu en direct (Thème Discord)</span>
          </label>
          <div className="p-4 rounded-xl bg-[#313338] border border-zinc-800 text-left font-sans select-none">
            <div className="flex items-start gap-3">
              <img
                src={bot.avatarUrl}
                alt={bot.username}
                className="w-10 h-10 rounded-full shrink-0 mt-0.5 object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white hover:underline cursor-pointer">
                    {bot.global_name || bot.username}
                  </span>
                  <span className="text-[10px] bg-[#5865F2] text-white px-1 rounded font-semibold uppercase">
                    BOT
                  </span>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    Aujourd'hui à {currentTimeFormatted}
                  </span>
                </div>

                {/* Plain content preview */}
                {content ? (
                  <p className="text-sm text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
                    {content}
                  </p>
                ) : !showEmbed ? (
                  <p className="text-sm text-zinc-500 italic">
                    Votre message apparaîtra ici...
                  </p>
                ) : null}

                {/* Embed preview */}
                {showEmbed && (embed.title || embed.description) && (
                  <div
                    className="mt-2 rounded-lg bg-[#2b2d31] p-3 max-w-lg border-l-4 space-y-2"
                    style={{ borderLeftColor: embed.color || '#5865F2' }}
                  >
                    {embed.authorName && (
                      <p className="text-xs font-semibold text-zinc-200">
                        {embed.authorName}
                      </p>
                    )}
                    {embed.title && (
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {embed.title}
                      </h4>
                    )}
                    {embed.description && (
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {embed.description}
                      </p>
                    )}
                    {(embed.footerText || embed.includeTimestamp) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1 border-t border-zinc-700/50">
                        {embed.footerText && <span>{embed.footerText}</span>}
                        {embed.footerText && embed.includeTimestamp && <span>•</span>}
                        {embed.includeTimestamp && <span>Aujourd'hui à {currentTimeFormatted}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback results */}
        {result && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-3 animate-in fade-in ${
              result.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}
          >
            {result.success ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-emerald-300">Message envoyé avec succès !</p>
                  <p className="text-emerald-400/90">
                    Le bot a bien délivré le message dans <strong>#{selectedChannel?.name}</strong>.
                    {result.messageId && <span className="font-mono ml-2 opacity-80">(ID: {result.messageId})</span>}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-red-300">Erreur lors de l'envoi du message</p>
                  <p className="text-red-400/90">{result.error}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Submit button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={
              isSending ||
              !selectedChannel ||
              (!content.trim() && (!showEmbed || (!embed.title && !embed.description)))
            }
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5865F2]/25"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Envoi en cours via Discord...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  Envoyer dans #{selectedChannel ? selectedChannel.name : 'salon'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
