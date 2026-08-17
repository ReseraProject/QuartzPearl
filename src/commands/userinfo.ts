import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

const statusLabels = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  invisible: "Invisible",
  offline: "Offline",
} as const;

function truncate(value: string, maximum = 1024): string {
  return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
}

export const userinfoCommand = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display account and server details for a member.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Member to inspect (defaults to yourself)."),
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const user = interaction.options.getUser("target") ?? interaction.user;
    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      await interaction.reply("That user is not a member of this server.");
      return;
    }

    const roles = member.roles.cache
      .filter((role) => role.id !== interaction.guild?.id)
      .sort((left, right) => right.position - left.position)
      .map((role) => role.toString());
    const status = statusLabels[member.presence?.status ?? "offline"];
    const created = Math.floor(user.createdTimestamp / 1000);
    const joined = member.joinedTimestamp
      ? Math.floor(member.joinedTimestamp / 1000)
      : undefined;

    const embed = new EmbedBuilder()
      .setColor(member.displayColor || 0xb9a7ff)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 512 }))
      .addFields(
        { name: "User", value: `${user} (${user.id})` },
        { name: "Status", value: status, inline: true },
        {
          name: "Account created",
          value: `<t:${created}:F>\n<t:${created}:R>`,
          inline: true,
        },
        {
          name: "Joined server",
          value: joined ? `<t:${joined}:F>\n<t:${joined}:R>` : "Unknown",
          inline: true,
        },
        {
          name: `Roles (${roles.length})`,
          value: truncate(roles.join(" ") || "None"),
        },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
