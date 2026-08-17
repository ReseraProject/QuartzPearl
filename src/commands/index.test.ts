import { describe, expect, test } from "bun:test";
import { PermissionFlagsBits } from "discord.js";
import { commands, commandsByName } from "./index.ts";

describe("command registry", () => {
  test("contains unique, valid slash commands", () => {
    const definitions = commands.map((command) => command.data.toJSON());
    const names = definitions.map(({ name }) => name);

    expect(names).toEqual([
      "ping",
      "about",
      "purge",
      "userinfo",
      "serverinfo",
      "avatar",
      "poll",
      "8ball",
      "roll",
      "coinflip",
      "admin-placeholder",
      "command-restrictions",
    ]);
    expect(commandsByName.size).toBe(commands.length);
    expect(definitions.every(({ description }) => description.length > 0)).toBe(
      true,
    );
  });

  test("locks both administrator commands to administrators", () => {
    for (const name of ["admin-placeholder", "command-restrictions"]) {
      expect(
        commandsByName.get(name)?.data.toJSON().default_member_permissions,
      ).toBe(PermissionFlagsBits.Administrator.toString());
    }
  });
});
