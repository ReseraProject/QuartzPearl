import { SlashCommandBuilder } from "discord.js";
import { database, type PollRecord } from "../database.ts";
import { buildPollMessage } from "../polls.ts";
import type { Command } from "./command.ts";

function pollOption(name: string, description: string, required: boolean) {
  return (option: import("discord.js").SlashCommandStringOption) =>
    option
      .setName(name)
      .setDescription(description)
      .setMaxLength(100)
      .setRequired(required);
}

export const pollCommand = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create an interactive poll with two to four options.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The poll question.")
        .setMaxLength(256)
        .setRequired(true),
    )
    .addStringOption(pollOption("option_a", "First voting option.", true))
    .addStringOption(pollOption("option_b", "Second voting option.", true))
    .addStringOption(pollOption("option_c", "Third voting option.", false))
    .addStringOption(pollOption("option_d", "Fourth voting option.", false)),

  async execute(interaction) {
    if (!interaction.guildId || !interaction.channelId) {
      await interaction.reply("Polls can only be created in a server channel.");
      return;
    }

    const options = ["option_a", "option_b", "option_c", "option_d"]
      .map((name) => interaction.options.getString(name))
      .filter((option): option is string => Boolean(option));
    const poll: PollRecord = {
      id: crypto.randomUUID(),
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      messageId: "",
      question: interaction.options.getString("question", true),
      options,
      votes: {},
      createdAt: new Date().toISOString(),
    };

    await interaction.reply(buildPollMessage(poll));
    const message = await interaction.fetchReply();
    poll.messageId = message.id;
    await database.createPoll(poll);
  },
} satisfies Command;
