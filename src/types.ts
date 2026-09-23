export interface DiscordBot {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar: string | null;
  avatarUrl: string;
  verified: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  iconUrl: string | null;
  owner?: boolean;
  permissions?: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: 'text' | 'announcement';
  parentId: string | null;
  position: number;
  topic: string | null;
}

export interface DiscordCategory {
  id: string;
  name: string;
  position: number;
}

export interface EmbedConfig {
  title: string;
  description: string;
  color: string;
  authorName: string;
  footerText: string;
  includeTimestamp: boolean;
}

export interface SentMessageLog {
  id: string;
  messageId?: string;
  channelId: string;
  channelName: string;
  guildId: string;
  guildName: string;
  content: string;
  embed?: EmbedConfig;
  timestamp: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}
