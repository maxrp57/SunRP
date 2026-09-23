import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Helper function to query Discord API
  async function callDiscordApi(endpoint: string, token: string, options: RequestInit = {}) {
    const cleanToken = token.replace(/^Bot\s+/i, "").trim();
    const url = `https://discord.com/api/v10${endpoint}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bot ${cleanToken}`,
        "Content-Type": "application/json",
        "User-Agent": "DiscordBotMessenger/1.0",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMessage = "Erreur Discord API inconnue";
      if (data && typeof data === "object") {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      return { ok: false, status: res.status, error: errorMessage, details: data };
    }

    return { ok: true, status: res.status, data };
  }

  // 1. Verify Bot Token & Fetch Bot Info
  app.post("/api/discord/verify", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== "string" || !token.trim()) {
        return res.status(400).json({ error: "Le token du bot est requis." });
      }

      const response = await callDiscordApi("/users/@me", token);
      if (!response.ok) {
        if (response.status === 401) {
          return res.status(401).json({
            error: "Token invalide ou non autorisé. Assurez-vous d'avoir copié le Token du bot (onglet Bot dans le Discord Developer Portal).",
          });
        }
        return res.status(response.status).json({
          error: response.error || "Impossible de vérifier le bot.",
          details: response.details,
        });
      }

      const bot = response.data;
      if (!bot.bot) {
        return res.status(400).json({
          error: "Ce token correspond à un compte utilisateur et non à un Bot d'application. Utilisez un Bot Token.",
        });
      }

      return res.json({
        id: bot.id,
        username: bot.username,
        discriminator: bot.discriminator,
        global_name: bot.global_name,
        avatar: bot.avatar,
        avatarUrl: bot.avatar
          ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png?size=256`
          : `https://cdn.discordapp.com/embed/avatars/${(parseInt(bot.discriminator, 10) || 0) % 5}.png`,
        verified: bot.verified,
      });
    } catch (err: any) {
      console.error("Error in /api/discord/verify:", err);
      return res.status(500).json({ error: "Erreur interne lors de la vérification du bot." });
    }
  });

  // 2. Fetch Guilds (Servers) where the bot is installed
  app.post("/api/discord/guilds", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token manquant." });
      }

      const response = await callDiscordApi("/users/@me/guilds", token);
      if (!response.ok) {
        return res.status(response.status).json({
          error: response.error || "Impossible de récupérer les serveurs du bot.",
          details: response.details,
        });
      }

      const rawGuilds = Array.isArray(response.data) ? response.data : [];
      const guilds = rawGuilds.map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        iconUrl: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
          : null,
        owner: g.owner,
        permissions: g.permissions,
      }));

      return res.json({ guilds });
    } catch (err: any) {
      console.error("Error in /api/discord/guilds:", err);
      return res.status(500).json({ error: "Erreur interne lors de la récupération des serveurs." });
    }
  });

  // 3. Fetch Channels for a specific Guild
  app.post("/api/discord/guilds/:guildId/channels", async (req, res) => {
    try {
      const { token } = req.body;
      const { guildId } = req.params;

      if (!token) {
        return res.status(400).json({ error: "Token manquant." });
      }
      if (!guildId) {
        return res.status(400).json({ error: "ID du serveur manquant." });
      }

      const response = await callDiscordApi(`/guilds/${guildId}/channels`, token);
      if (!response.ok) {
        if (response.status === 403) {
          return res.status(403).json({
            error: "Le bot n'a pas les permissions nécessaires pour lister les salons de ce serveur (permission 'Voir les salons' requise).",
            details: response.details,
          });
        }
        return res.status(response.status).json({
          error: response.error || "Impossible de lister les salons.",
          details: response.details,
        });
      }

      const allChannels = Array.isArray(response.data) ? response.data : [];

      // Channel types in Discord API:
      // 0 = GUILD_TEXT
      // 2 = GUILD_VOICE
      // 4 = GUILD_CATEGORY
      // 5 = GUILD_ANNOUNCEMENT
      // 15 = GUILD_FORUM
      const categories = allChannels.filter((c: any) => c.type === 4);
      const textChannels = allChannels.filter((c: any) => c.type === 0 || c.type === 5);

      return res.json({
        channels: textChannels.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type === 5 ? "announcement" : "text",
          parentId: c.parent_id,
          position: c.position,
          topic: c.topic || null,
        })),
        categories: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          position: cat.position,
        })),
      });
    } catch (err: any) {
      console.error("Error in /api/discord/guilds/:guildId/channels:", err);
      return res.status(500).json({ error: "Erreur interne lors de la récupération des salons." });
    }
  });

  // 4. Send a Message to a Channel
  app.post("/api/discord/channels/:channelId/messages", async (req, res) => {
    try {
      const { token, content, embed } = req.body;
      const { channelId } = req.params;

      if (!token) {
        return res.status(400).json({ error: "Token manquant." });
      }
      if (!channelId) {
        return res.status(400).json({ error: "ID du salon manquant." });
      }

      const hasContent = typeof content === "string" && content.trim().length > 0;
      const hasEmbed = embed && (embed.title || embed.description || embed.fields?.length > 0);

      if (!hasContent && !hasEmbed) {
        return res.status(400).json({
          error: "Veuillez saisir un texte de message ou configurer un Embed.",
        });
      }

      const payload: any = {};
      if (hasContent) {
        payload.content = content.trim();
      }

      if (hasEmbed) {
        payload.embeds = [
          {
            title: embed.title || undefined,
            description: embed.description || undefined,
            color: embed.color ? parseInt(embed.color.replace("#", ""), 16) : 0x5865f2,
            author: embed.authorName ? { name: embed.authorName } : undefined,
            footer: embed.footerText ? { text: embed.footerText } : undefined,
            timestamp: embed.includeTimestamp ? new Date().toISOString() : undefined,
          },
        ];
      }

      const response = await callDiscordApi(
        `/channels/${channelId}/messages`,
        token,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          return res.status(403).json({
            error: "Permission refusée : Le bot n'a pas la permission 'Envoyer des messages' ou 'Intégrer des liens' dans ce salon.",
            details: response.details,
          });
        }
        return res.status(response.status).json({
          error: response.error || "Impossible d'envoyer le message.",
          details: response.details,
        });
      }

      return res.json({
        success: true,
        messageId: response.data?.id,
        channelId: response.data?.channel_id,
        timestamp: response.data?.timestamp,
        data: response.data,
      });
    } catch (err: any) {
      console.error("Error in /api/discord/channels/:channelId/messages:", err);
      return res.status(500).json({ error: "Erreur interne lors de l'envoi du message." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
