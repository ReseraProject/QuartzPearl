import { aboutCommand } from "./about.ts";
import { adminPlaceholderCommand } from "./admin-placeholder.ts";
import { avatarCommand } from "./avatar.ts";
import { coinflipCommand } from "./coinflip.ts";
import type { Command } from "./command.ts";
import { commandRestrictionsCommand } from "./command-restrictions.ts";
import { eightBallCommand } from "./eightball.ts";
import { pingCommand } from "./ping.ts";
import { pollCommand } from "./poll.ts";
import { purgeCommand } from "./purge.ts";
import { rollCommand } from "./roll.ts";
import { serverinfoCommand } from "./serverinfo.ts";
import { userinfoCommand } from "./userinfo.ts";

export const commands: readonly Command[] = [
  pingCommand,
  aboutCommand,
  purgeCommand,
  userinfoCommand,
  serverinfoCommand,
  avatarCommand,
  pollCommand,
  eightBallCommand,
  rollCommand,
  coinflipCommand,
  adminPlaceholderCommand,
  commandRestrictionsCommand,
];

export const commandsByName = new Map(
  commands.map((command) => [command.data.name, command] as const),
);

if (commandsByName.size !== commands.length) {
  throw new Error("Command names must be unique");
}
