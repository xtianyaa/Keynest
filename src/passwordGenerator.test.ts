import { describe, expect, it } from "vitest";
import { calculatePasswordStrength, generatePassword } from "./passwordGenerator";

describe("password generator", () => {
  it("generates a strong password with the requested character groups", () => {
    const password = generatePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true
    });

    expect(password).toHaveLength(20);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*]/);
    expect(calculatePasswordStrength(password).label).toBe("强");
  });

  it("enforces a minimum length and at least one character group", () => {
    expect(() =>
      generatePassword({
        length: 4,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      })
    ).toThrow("至少选择一类字符");

    expect(
      generatePassword({
        length: 4,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false
      })
    ).toHaveLength(8);
  });
});
