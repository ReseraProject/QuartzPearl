import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const aboutCommand = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("Learn about QuartzPearl."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xb9a7ff)
      .setTitle("QuartzPearl")
      .setDescription(
        "A Discord bot for the Resera community, built with discord.js and Bun.",
      )
      .setFooter({ text: "QuartzPearl · Resera" });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
