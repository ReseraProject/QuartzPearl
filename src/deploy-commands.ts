import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.ts";
import { loadConfig } from "./config.ts";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.token);
const definitions = commands.map((command) => command.data.toJSON());
const route = config.guildId
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)
  : Routes.applicationCommands(config.clientId);

await rest.put(route, { body: definitions });

const target = config.guildId ? `guild ${config.guildId}` : "globally";
console.log(`Registered ${definitions.length} command(s) ${target}.`);
