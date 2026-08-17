import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./command.ts";

export const adminPlaceholderCommand = {
  data: new SlashCommandBuilder()
    .setName("admin-placeholder")
    .setDescription("Reserved for a future administrator tool.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        content: "This command is restricted to administrators.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: "Administrator placeholder acknowledged.",
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
