import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's response and Discord gateway latency."),

  async execute(interaction) {
    const roundTrip = Date.now() - interaction.createdTimestamp;
    const gateway = Math.max(0, Math.round(interaction.client.ws.ping));

    await interaction.reply(
      `Pong! Round trip: ${roundTrip}ms · Gateway: ${gateway}ms`,
    );
  },
} satisfies Command;
