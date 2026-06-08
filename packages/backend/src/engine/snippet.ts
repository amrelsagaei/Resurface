const DEFAULT_SNIPPET_WINDOW = 80;

export function extractSnippet(
  text: string,
  index: number,
  length: number,
  window = DEFAULT_SNIPPET_WINDOW,
): string {
  const start = Math.max(0, index - window);
  const end = Math.min(text.length, index + length + window);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
