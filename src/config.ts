export type Environment = Readonly<Record<string, string | undefined>>;

export interface BotConfig {
  readonly token: string;
  readonly clientId: string;
  readonly guildId?: string;
}

function required(env: Environment, name: string): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadConfig(env: Environment = process.env): BotConfig {
  const guildId = env.DISCORD_GUILD_ID?.trim();

  return Object.freeze({
    token: required(env, "DISCORD_TOKEN"),
    clientId: required(env, "DISCORD_CLIENT_ID"),
    ...(guildId ? { guildId } : {}),
  });
}
