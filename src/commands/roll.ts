import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./command.ts";

export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
}

export function parseDiceNotation(
  notation: string,
): DiceExpression | undefined {
  const match = /^(\d{1,3})d(\d{1,4})([+-]\d{1,5})?$/i.exec(notation.trim());
  if (!match) return undefined;

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const modifier = Number(match[3] ?? 0);

  if (count < 1 || count > 100 || sides < 2 || sides > 1000) {
    return undefined;
  }

  return { count, sides, modifier };
}

export const rollCommand = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll dice using notation such as 1d20 or 2d6+3.")
    .addStringOption((option) =>
      option
        .setName("dice")
        .setDescription("Dice notation (default: 1d6; max: 100d1000).")
        .setMaxLength(20),
    ),

  async execute(interaction) {
    const notation = interaction.options.getString("dice") ?? "1d6";
    const expression = parseDiceNotation(notation);

    if (!expression) {
      await interaction.reply(
        "Invalid dice notation. Try `1d20`, `2d6`, or `4d8+2` (maximum 100d1000).",
      );
      return;
    }

    const rolls = Array.from(
      { length: expression.count },
      () => Math.floor(Math.random() * expression.sides) + 1,
    );
    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = subtotal + expression.modifier;
    const modifier =
      expression.modifier === 0
        ? ""
        : ` ${expression.modifier > 0 ? "+" : "−"} ${Math.abs(expression.modifier)}`;

    await interaction.reply(
      `🎲 **${expression.count}d${expression.sides}${expression.modifier >= 0 && expression.modifier !== 0 ? "+" : ""}${expression.modifier || ""}**\nRolls: ${rolls.join(", ")}${modifier}\n**Total: ${total}**`,
    );
  },
} satisfies Command;
