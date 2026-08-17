import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const coinflipCommand = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a virtual coin."),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    await interaction.reply(`🪙 **${result}!**`);
  },
} satisfies Command;
