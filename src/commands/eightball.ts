import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export const eightBallAnswers = [
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes — definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
] as const;

export const eightBallCommand = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a yes-or-no question.")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question for the magic 8-ball.")
        .setMaxLength(500)
        .setRequired(true),
    ),

  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    const answer =
      eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];

    await interaction.reply(`🎱 **${question}**\n${answer}`);
  },
} satisfies Command;
