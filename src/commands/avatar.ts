import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const avatarCommand = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show a full-resolution user avatar.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose avatar to display (defaults to yourself)."),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 4096 });
    const embed = new EmbedBuilder()
      .setColor(0xb9a7ff)
      .setTitle(`${user.displayName}'s avatar`)
      .setURL(avatarUrl)
      .setImage(avatarUrl)
      .setFooter({ text: user.tag });

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
