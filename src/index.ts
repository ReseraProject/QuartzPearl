import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { commandsByName } from "./commands/index.ts";
import { loadConfig } from "./config.ts";
import { database } from "./database.ts";
import { handlePollVote } from "./polls.ts";

const config = loadConfig();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`QuartzPearl is ready as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId.startsWith("poll:")) {
    try {
      await handlePollVote(interaction, database);
    } catch (error) {
      console.error("Poll vote failed:", error);
      const response = {
        content: "Something went wrong while recording that vote.",
        flags: MessageFlags.Ephemeral,
      } as const;

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response).catch(console.error);
      } else {
        await interaction.reply(response).catch(console.error);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commandsByName.get(interaction.commandName);

  if (!command) {
    console.warn(`Ignoring unknown command: ${interaction.commandName}`);
    return;
  }

  try {
    if (
      interaction.guildId &&
      interaction.channelId &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
      (await database.isCommandChannelBlocked(
        interaction.guildId,
        interaction.channelId,
      ))
    ) {
      await interaction.reply({
        content: "Commands are disabled for regular users in this channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    console.error(`Command /${interaction.commandName} failed:`, error);

    const response = {
      content: "Something went wrong while running that command.",
      flags: MessageFlags.Ephemeral,
    } as const;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(console.error);
    } else {
      await interaction.reply(response).catch(console.error);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

process.once("SIGINT", () => client.destroy());
process.once("SIGTERM", () => client.destroy());

await client.login(config.token);
