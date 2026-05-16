export type PasswordGeneratorOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export type PasswordStrength = {
  score: number;
  label: "弱" | "中" | "强";
};

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*";
const MIN_LENGTH = 8;

function randomIndex(max: number) {
  const values = new Uint32Array(1);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
    return values[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function pick(source: string) {
  return source[randomIndex(source.length)];
}

function shuffle(value: string[]) {
  for (let index = value.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [value[index], value[swapIndex]] = [value[swapIndex], value[index]];
  }
  return value;
}

export function generatePassword(options: PasswordGeneratorOptions) {
  const groups = [
    options.uppercase ? UPPERCASE : "",
    options.lowercase ? LOWERCASE : "",
    options.numbers ? NUMBERS : "",
    options.symbols ? SYMBOLS : ""
  ].filter(Boolean);

  if (groups.length === 0) {
    throw new Error("至少选择一类字符");
  }

  const length = Math.max(MIN_LENGTH, Math.floor(options.length));
  const allCharacters = groups.join("");
  const password = groups.map(pick);

  while (password.length < length) {
    password.push(pick(allCharacters));
  }

  return shuffle(password).join("");
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*]/.test(password)) score += 1;

  if (score >= 4) return { score, label: "强" };
  if (score >= 2) return { score, label: "中" };
  return { score, label: "弱" };
}
