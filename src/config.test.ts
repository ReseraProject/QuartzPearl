import { describe, expect, test } from "bun:test";
import { loadConfig } from "./config.ts";

describe("loadConfig", () => {
  test("loads required values and an optional guild", () => {
    expect(
      loadConfig({
        DISCORD_TOKEN: " token ",
        DISCORD_CLIENT_ID: " client ",
        DISCORD_GUILD_ID: " guild ",
      }),
    ).toEqual({
      token: "token",
      clientId: "client",
      guildId: "guild",
    });
  });

  test("omits an empty guild ID", () => {
    expect(
      loadConfig({
        DISCORD_TOKEN: "token",
        DISCORD_CLIENT_ID: "client",
        DISCORD_GUILD_ID: "  ",
      }),
    ).toEqual({ token: "token", clientId: "client" });
  });

  test("rejects missing required values", () => {
    expect(() => loadConfig({ DISCORD_CLIENT_ID: "client" })).toThrow(
      "Missing required environment variable: DISCORD_TOKEN",
    );
  });
});
