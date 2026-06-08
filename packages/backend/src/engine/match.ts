import { type Transform } from "shared";

import { TOKEN_PREFIX } from "./token";

const TRUNCATE_KEEP = 6;

type Match = {
  canaryId: string;
  token: string;
  transform: Transform;
  index: number;
  length: number;
};

type Candidate = { value: string; transform: Transform };

function candidates(token: string): Candidate[] {
  const list: Candidate[] = [{ value: token, transform: "raw" }];

  const upper = token.toUpperCase();
  if (upper !== token) {
    list.push({ value: upper, transform: "uppercase" });
  }

  const truncated = token.slice(0, TOKEN_PREFIX.length + TRUNCATE_KEEP);
  if (truncated.length < token.length) {
    list.push({ value: truncated, transform: "truncated" });
  }

  return list;
}

export function hasPrefix(text: string): boolean {
  return text.toLowerCase().includes(TOKEN_PREFIX);
}

function occurrences(text: string, value: string): number[] {
  const found: number[] = [];
  let from = text.indexOf(value);
  while (from >= 0) {
    found.push(from);
    from = text.indexOf(value, from + 1);
  }
  return found;
}

export function findMatches(
  text: string,
  canaries: ReadonlyArray<{ id: string; token: string }>,
): Match[] {
  if (!hasPrefix(text)) {
    return [];
  }

  const matches: Match[] = [];
  for (const canary of canaries) {
    for (const candidate of candidates(canary.token)) {
      const found = occurrences(text, candidate.value);
      if (found.length === 0) {
        continue;
      }
      for (const index of found) {
        matches.push({
          canaryId: canary.id,
          token: canary.token,
          transform: candidate.transform,
          index,
          length: candidate.value.length,
        });
      }
      break;
    }
  }
  return matches;
}
