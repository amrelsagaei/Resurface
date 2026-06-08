import { type Canary, type Sighting } from "shared";

export type Writeup = {
  title: string;
  description: string;
};

function sanitize(snippet: string): string {
  return snippet.replace(/`/g, "'").replace(/@(everyone|here)/g, "@-$1");
}

export function buildWriteup(sighting: Sighting, canary: Canary): Writeup {
  const where = `${sighting.endpoint.method} ${sighting.endpoint.host}${sighting.endpoint.path}`;
  const tags = canary.tags.length > 0 ? canary.tags.join(", ") : "none";

  const title = `Resurface: canary in ${sighting.contextType} at ${sighting.endpoint.host}${sighting.endpoint.path}`;
  const lines = [
    `Canary ${canary.token} (tags: ${tags}) resurfaced in ${where} inside ${sighting.contextType}.`,
    `Source: ${sighting.source}. Transform: ${sighting.transform}.`,
    "Snippet:",
    sanitize(sighting.snippet),
  ];
  if (sighting.capHit) {
    lines.push(
      "Note: body scan cap was hit - a later occurrence may be missed.",
    );
  }

  return { title, description: lines.join("\n") };
}
