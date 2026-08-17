import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const serverinfoCommand = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show statistics and details about this server.")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply("This command can only be used in a server.");
      return;
    }

    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    const textChannels = guild.channels.cache.filter((channel) =>
      [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildMedia,
      ].includes(channel.type),
    ).size;
    const voiceChannels = guild.channels.cache.filter((channel) =>
      [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(
        channel.type,
      ),
    ).size;
    const created = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor(0xb9a7ff)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        { name: "Owner", value: owner.toString(), inline: true },
        {
          name: "Members",
          value: guild.memberCount.toLocaleString(),
          inline: true,
        },
        {
          name: "Channels",
          value: `${guild.channels.cache.size} total\n${textChannels} text/forum\n${voiceChannels} voice/stage`,
          inline: true,
        },
        {
          name: "Boosts",
          value: `${guild.premiumSubscriptionCount ?? 0} boosts · Level ${guild.premiumTier}`,
          inline: true,
        },
        {
          name: "Roles",
          value: guild.roles.cache.size.toLocaleString(),
          inline: true,
        },
        {
          name: "Created",
          value: `<t:${created}:F>\n<t:${created}:R>`,
          inline: true,
        },
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
} satisfies Command;
