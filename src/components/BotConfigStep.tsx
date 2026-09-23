import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, AlertCircle, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface BotConfigStepProps {
  token: string;
  setToken: (token: string) => void;
  onVerify: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const BotConfigStep: React.FC<BotConfigStepProps> = ({
  token,
  setToken,
  onVerify,
  isLoading,
  error,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    onVerify();
  };

  return (
    <div className="bg-[#2b2d31] border border-zinc-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] text-xs font-semibold mb-2">
            <span>Étape 1</span>
            <span>•</span>
            <span>Authentification</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Connectez votre Bot Discord
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Entrez le Token secret de votre bot pour charger ses serveurs et lui permettre d'envoyer des messages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-[#1e1f22] px-3 py-1.5 rounded-lg border border-zinc-700/60 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#5865F2]" />
          <span>{showGuide ? 'Masquer le guide' : 'Où trouver mon Token ?'}</span>
        </button>
      </div>

      {showGuide && (
        <div className="mb-6 p-4 rounded-xl bg-[#1e1f22] border border-zinc-700/60 text-xs text-zinc-300 space-y-2">
          <h4 className="font-semibold text-white flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Comment obtenir le Token de votre Bot Discord :
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 ml-1">
            <li>
              Rendez-vous sur le{' '}
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5865F2] underline hover:text-[#7983f5]"
              >
                Portail Développeur Discord
              </a>.
            </li>
            <li>Créez une application ou cliquez sur votre bot existant.</li>
            <li>Dans le menu de gauche, rendez-vous dans l'onglet <strong>Bot</strong>.</li>
            <li>
              Sous le pseudo du bot, cliquez sur <strong>Reset Token</strong> (Réinitialiser le token) puis confirmez.
            </li>
            <li>
              Copiez le token généré et collez-le dans le champ ci-dessous.
            </li>
          </ol>
          <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-800">
            🔒 <em>Note de sécurité :</em> Le token est transmis uniquement pour exécuter vos commandes d'envoi de message vers l'API Discord officielle et n'est jamais partagé.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Token du Bot Discord
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ex: MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.G..."
              className="w-full bg-[#1e1f22] text-white text-sm rounded-xl pl-10 pr-12 py-3 border border-zinc-700/70 focus:outline-none focus:border-[#5865F2] focus:ring-2 focus:ring-[#5865F2]/20 font-mono tracking-wider transition-all placeholder:text-zinc-600"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200"
              title={showToken ? 'Masquer' : 'Afficher'}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Échec de vérification</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || !token.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.98] text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5865F2]/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification auprès de Discord...</span>
              </>
            ) : (
              <>
                <span>Connecter & Vérifier le Bot</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
