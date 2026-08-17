import { describe, expect, test } from "bun:test";
import { parseDiceNotation } from "./roll.ts";

describe("parseDiceNotation", () => {
  test("parses standard dice notation", () => {
    expect(parseDiceNotation("2d6")).toEqual({
      count: 2,
      sides: 6,
      modifier: 0,
    });
    expect(parseDiceNotation("1D20+4")).toEqual({
      count: 1,
      sides: 20,
      modifier: 4,
    });
    expect(parseDiceNotation("4d8-2")).toEqual({
      count: 4,
      sides: 8,
      modifier: -2,
    });
  });

  test("rejects malformed and excessive rolls", () => {
    expect(parseDiceNotation("d20")).toBeUndefined();
    expect(parseDiceNotation("101d6")).toBeUndefined();
    expect(parseDiceNotation("1d1")).toBeUndefined();
    expect(parseDiceNotation("1d1001")).toBeUndefined();
  });
});
