import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { database } from "../database.ts";
import type { Command } from "./command.ts";

export const commandRestrictionsCommand = {
  data: new SlashCommandBuilder()
    .setName("command-restrictions")
    .setDescription(
      "Configure channels where regular users cannot use commands.",
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription(
          "Whether to block, unblock, or list restricted channels.",
        )
        .setRequired(true)
        .addChoices(
          { name: "Block a channel", value: "block" },
          { name: "Unblock a channel", value: "unblock" },
          { name: "List blocked channels", value: "list" },
        ),
    )
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Channel to block or unblock."),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    if (
      !interaction.guildId ||
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        content: "This command is restricted to server administrators.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const action = interaction.options.getString("action", true);

    if (action === "list") {
      const channelIds = await database.getBlockedCommandChannelIds(
        interaction.guildId,
      );
      await interaction.reply({
        content:
          channelIds.length === 0
            ? "Regular users can currently use commands in every channel."
            : `Commands are blocked for regular users in:\n${channelIds.map((id) => `• <#${id}>`).join("\n")}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.options.getChannel("channel");
    if (!channel) {
      await interaction.reply({
        content: `The channel option is required when using ${action}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const blocked = action === "block";
    const changed = await database.setCommandChannelBlocked(
      interaction.guildId,
      channel.id,
      blocked,
    );
    const state = blocked ? "blocked in" : "allowed in";

    await interaction.reply({
      content: changed
        ? `Regular-user commands are now ${state} <#${channel.id}>.`
        : `Regular-user commands were already ${state} <#${channel.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
  },
} satisfies Command;
