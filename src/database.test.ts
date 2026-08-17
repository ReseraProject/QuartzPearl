import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonDatabase, type PollRecord } from "./database.ts";

const temporaryDirectories: string[] = [];

async function temporaryDatabase(): Promise<JsonDatabase> {
  const directory = await mkdtemp(join(tmpdir(), "quartzpearl-test-"));
  temporaryDirectories.push(directory);
  return new JsonDatabase(join(directory, "database.json"));
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("JsonDatabase", () => {
  test("persists command-channel restrictions", async () => {
    const database = await temporaryDatabase();

    expect(
      await database.setCommandChannelBlocked("guild", "channel", true),
    ).toBe(true);
    expect(await database.isCommandChannelBlocked("guild", "channel")).toBe(
      true,
    );
    expect(
      await database.setCommandChannelBlocked("guild", "channel", true),
    ).toBe(false);
    expect(
      await database.setCommandChannelBlocked("guild", "channel", false),
    ).toBe(true);
    expect(await database.isCommandChannelBlocked("guild", "channel")).toBe(
      false,
    );
  });

  test("stores one current vote per user", async () => {
    const database = await temporaryDatabase();
    const poll: PollRecord = {
      id: "poll",
      guildId: "guild",
      channelId: "channel",
      messageId: "message",
      question: "Pick one",
      options: ["A", "B"],
      votes: {},
      createdAt: new Date(0).toISOString(),
    };

    await database.createPoll(poll);
    await database.voteInPoll("poll", "user", 0);
    const updated = await database.voteInPoll("poll", "user", 1);

    expect(updated?.votes).toEqual({ user: 1 });
    expect(await database.voteInPoll("poll", "user", 5)).toBeUndefined();
  });

  test("serializes concurrent writes", async () => {
    const database = await temporaryDatabase();

    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        database.setCommandChannelBlocked("guild", `channel-${index}`, true),
      ),
    );

    expect(await database.getBlockedCommandChannelIds("guild")).toHaveLength(
      20,
    );
  });
});
