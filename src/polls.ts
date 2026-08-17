import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type ButtonInteraction,
  type InteractionReplyOptions,
} from "discord.js";
import type { JsonDatabase, PollRecord } from "./database.ts";

const labels = ["A", "B", "C", "D"] as const;
const styles = [
  ButtonStyle.Primary,
  ButtonStyle.Success,
  ButtonStyle.Secondary,
  ButtonStyle.Danger,
] as const;

export function buildPollMessage(
  poll: PollRecord,
): Pick<InteractionReplyOptions, "embeds" | "components"> {
  const counts = poll.options.map(
    (_, optionIndex) =>
      Object.values(poll.votes).filter((vote) => vote === optionIndex).length,
  );
  const totalVotes = Object.keys(poll.votes).length;

  const embed = new EmbedBuilder()
    .setColor(0xb9a7ff)
    .setTitle(poll.question)
    .setDescription(
      poll.options
        .map(
          (option, index) =>
            `**${labels[index]}.** ${option} — **${counts[index]}** vote${counts[index] === 1 ? "" : "s"}`,
        )
        .join("\n"),
    )
    .setFooter({
      text: `${totalVotes} total vote${totalVotes === 1 ? "" : "s"} · One vote per user`,
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    poll.options.map((_, index) =>
      new ButtonBuilder()
        .setCustomId(`poll:${poll.id}:${index}`)
        .setLabel(labels[index] ?? String(index + 1))
        .setStyle(styles[index] ?? ButtonStyle.Secondary),
    ),
  );

  return { embeds: [embed], components: [row] };
}

export async function handlePollVote(
  interaction: ButtonInteraction,
  database: JsonDatabase,
): Promise<void> {
  const [, pollId, rawOptionIndex] = interaction.customId.split(":");
  const optionIndex = Number(rawOptionIndex);

  if (!pollId || !Number.isInteger(optionIndex)) {
    await interaction.reply({
      content: "That poll button is invalid.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const existing = await database.getPoll(pollId);
  if (
    !existing ||
    existing.messageId !== interaction.message.id ||
    existing.guildId !== interaction.guildId
  ) {
    await interaction.reply({
      content: "This poll is no longer available.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const updated = await database.voteInPoll(
    pollId,
    interaction.user.id,
    optionIndex,
  );

  if (!updated) {
    await interaction.reply({
      content: "That voting option is no longer available.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.update(buildPollMessage(updated));
}
