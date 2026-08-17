import { mkdir, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface PollRecord {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  createdAt: string;
}

interface GuildSettings {
  blockedCommandChannelIds: string[];
}

interface DatabaseSchema {
  version: 1;
  guilds: Record<string, GuildSettings>;
  polls: Record<string, PollRecord>;
}

function emptyDatabase(): DatabaseSchema {
  return { version: 1, guilds: {}, polls: {} };
}

function isDatabaseSchema(value: unknown): value is DatabaseSchema {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<DatabaseSchema>;
  return (
    candidate.version === 1 &&
    typeof candidate.guilds === "object" &&
    candidate.guilds !== null &&
    typeof candidate.polls === "object" &&
    candidate.polls !== null
  );
}

export class JsonDatabase {
  readonly filePath: string;
  private cache?: DatabaseSchema;
  private loading?: Promise<DatabaseSchema>;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath = resolve("data", "database.json")) {
    this.filePath = filePath;
  }

  private async read(): Promise<DatabaseSchema> {
    if (this.cache) return this.cache;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const file = Bun.file(this.filePath);
      if (!(await file.exists())) {
        const fresh = emptyDatabase();
        this.cache = fresh;
        return fresh;
      }

      let parsed: unknown;
      try {
        parsed = await file.json();
      } catch (error) {
        throw new Error(`Could not parse JSON database at ${this.filePath}`, {
          cause: error,
        });
      }

      if (!isDatabaseSchema(parsed)) {
        throw new Error(`Unsupported JSON database schema at ${this.filePath}`);
      }

      this.cache = parsed;
      return parsed;
    })();

    try {
      return await this.loading;
    } finally {
      this.loading = undefined;
    }
  }

  private async persist(data: DatabaseSchema): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;

    try {
      await Bun.write(temporaryPath, `${JSON.stringify(data, null, 2)}\n`);
      await rename(temporaryPath, this.filePath);
    } catch (error) {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }

  private update<T>(mutation: (data: DatabaseSchema) => T): Promise<T> {
    const operation = this.writeQueue.then(async () => {
      const data = structuredClone(await this.read());
      const result = mutation(data);
      await this.persist(data);
      this.cache = data;
      return result;
    });

    this.writeQueue = operation.then(
      () => undefined,
      () => undefined,
    );

    return operation;
  }

  async getBlockedCommandChannelIds(guildId: string): Promise<string[]> {
    return [
      ...((await this.read()).guilds[guildId]?.blockedCommandChannelIds ?? []),
    ];
  }

  async isCommandChannelBlocked(
    guildId: string,
    channelId: string,
  ): Promise<boolean> {
    return (await this.getBlockedCommandChannelIds(guildId)).includes(
      channelId,
    );
  }

  setCommandChannelBlocked(
    guildId: string,
    channelId: string,
    blocked: boolean,
  ): Promise<boolean> {
    return this.update((data) => {
      const settings = (data.guilds[guildId] ??= {
        blockedCommandChannelIds: [],
      });
      const currentlyBlocked =
        settings.blockedCommandChannelIds.includes(channelId);

      if (blocked && !currentlyBlocked) {
        settings.blockedCommandChannelIds.push(channelId);
        return true;
      }

      if (!blocked && currentlyBlocked) {
        settings.blockedCommandChannelIds =
          settings.blockedCommandChannelIds.filter((id) => id !== channelId);
        return true;
      }

      return false;
    });
  }

  createPoll(poll: PollRecord): Promise<void> {
    return this.update((data) => {
      data.polls[poll.id] = structuredClone(poll);
    });
  }

  async getPoll(pollId: string): Promise<PollRecord | undefined> {
    const poll = (await this.read()).polls[pollId];
    return poll ? structuredClone(poll) : undefined;
  }

  voteInPoll(
    pollId: string,
    userId: string,
    optionIndex: number,
  ): Promise<PollRecord | undefined> {
    return this.update((data) => {
      const poll = data.polls[pollId];
      if (!poll || optionIndex < 0 || optionIndex >= poll.options.length) {
        return undefined;
      }

      poll.votes[userId] = optionIndex;
      return structuredClone(poll);
    });
  }
}

export const database = new JsonDatabase();
