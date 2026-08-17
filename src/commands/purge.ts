import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "./command.ts";

export const purgeCommand = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk-delete messages from the current channel.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Only delete messages sent by this user."),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.channel;
    if (
      !interaction.inCachedGuild() ||
      !channel ||
      !channel.isTextBased() ||
      !("bulkDelete" in channel)
    ) {
      await interaction.reply({
        content: "Messages cannot be purged in this channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (
      !interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)
    ) {
      await interaction.reply({
        content: "You need the Manage Messages permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const botPermissions = interaction.guild.members.me?.permissionsIn(channel);
    if (
      !botPermissions?.has([
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ])
    ) {
      await interaction.reply({
        content:
          "I need View Channel, Read Message History, and Manage Messages permissions here.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const amount = interaction.options.getInteger("amount", true);
    const target = interaction.options.getUser("target");
    const fetched = await channel.messages.fetch({ limit: 100 });
    const candidates = fetched
      .filter((message) => !target || message.author.id === target.id)
      .first(amount);
    const deleted = await channel.bulkDelete(candidates, true);
    const targetText = target ? ` from ${target.tag}` : "";
    const shortfall =
      deleted.size < amount
        ? " Some requested messages were too old or not found."
        : "";

    await interaction.editReply(
      `Deleted ${deleted.size} message${deleted.size === 1 ? "" : "s"}${targetText}.${shortfall}`,
    );
  },
} satisfies Command;
