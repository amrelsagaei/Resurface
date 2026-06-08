import { randomInt } from "crypto";

export const TOKEN_PREFIX = "cnry0";

const BASE36 = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomBase36(length: number): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += BASE36.charAt(randomInt(BASE36.length));
  }
  return out;
}

export function generateToken(length: number): string {
  const size = length > 0 ? length : 10;
  return `${TOKEN_PREFIX}${randomBase36(size)}`;
}
