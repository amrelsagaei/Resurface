import { type FrontendSDK } from "@/types";

const Commands = {
  generate: "resurface.generate-canary",
  toggle: "resurface.toggle-watching",
} as const;

async function generateCanary(sdk: FrontendSDK): Promise<void> {
  const result = await sdk.backend.generateCanary();
  if (result.kind === "Error") {
    sdk.window.showToast(result.error, { variant: "error" });
    return;
  }
  await navigator.clipboard.writeText(result.value.token);
  sdk.window.showToast(`Canary copied: ${result.value.token}`, {
    variant: "success",
  });
}

async function toggleWatching(sdk: FrontendSDK): Promise<void> {
  const current = await sdk.backend.getWatching();
  if (current.kind === "Error") {
    sdk.window.showToast(current.error, { variant: "error" });
    return;
  }
  const next = await sdk.backend.setWatching(!current.value);
  if (next.kind === "Ok") {
    sdk.window.showToast(next.value ? "Watching enabled" : "Watching paused", {
      variant: "info",
    });
  } else {
    sdk.window.showToast(next.error, { variant: "error" });
  }
}

export function registerCommands(sdk: FrontendSDK): void {
  sdk.commands.register(Commands.generate, {
    name: "Generate canary",
    group: "Resurface",
    run: () => generateCanary(sdk),
  });
  sdk.commands.register(Commands.toggle, {
    name: "Toggle watching",
    group: "Resurface",
    run: () => toggleWatching(sdk),
  });

  for (const id of Object.values(Commands)) {
    sdk.commandPalette.register(id);
  }
}
