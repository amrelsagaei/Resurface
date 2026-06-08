import { type WebhookFormat } from "shared";

import { type Writeup } from "../engine/template";

const DISCORD_LIMIT = 1800;

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function formatPayload(
  format: WebhookFormat,
  writeup: Writeup,
): unknown {
  switch (format) {
    case "discord":
      return {
        content: clip(
          `**${writeup.title}**\n\`\`\`\n${writeup.description}\n\`\`\``,
          DISCORD_LIMIT,
        ),
      };
    case "slack":
      return {
        text: `*${writeup.title}*\n\`\`\`${writeup.description}\`\`\``,
      };
    default:
      return { title: writeup.title, description: writeup.description };
  }
}
