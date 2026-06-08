import { type ContextType } from "shared";

function lastNonSpace(text: string): string {
  const trimmed = text.replace(/\s+$/, "");
  return trimmed.charAt(trimmed.length - 1);
}

function firstNonSpace(text: string): string {
  return text.replace(/^\s+/, "").charAt(0);
}

function inScript(text: string, index: number): boolean {
  const open = text.lastIndexOf("<script", index);
  if (open === -1) {
    return false;
  }
  const close = text.indexOf("</script", open);
  return close === -1 || close > index;
}

function inAttribute(text: string, index: number): boolean {
  const lt = text.lastIndexOf("<", index);
  const gt = text.lastIndexOf(">", index);
  if (lt <= gt) {
    return false;
  }
  const segment = text.slice(lt, index);
  const eq = segment.lastIndexOf("=");
  if (eq === -1) {
    return false;
  }
  const afterEq = segment.slice(eq + 1).trimStart();
  return afterEq.startsWith('"') || afterEq.startsWith("'");
}

function inJsonString(text: string, index: number): boolean {
  const before = text.slice(0, index);
  const openQuote = before.lastIndexOf('"');
  const closeQuote = text.indexOf('"', index);
  if (openQuote === -1 || closeQuote === -1) {
    return false;
  }
  const pre = lastNonSpace(before.slice(0, openQuote));
  if (pre !== ":" && pre !== "," && pre !== "{" && pre !== "[") {
    return false;
  }
  return firstNonSpace(text.slice(closeQuote + 1)) !== ":";
}

function inUrl(text: string, index: number): boolean {
  const segment = text.slice(Math.max(0, index - 100), index);
  return /[a-z][a-z0-9+.-]*:\/\/[^\s"'<>]*$/i.test(segment);
}

function inHtmlText(text: string, index: number): boolean {
  const lt = text.lastIndexOf("<", index);
  const gt = text.lastIndexOf(">", index);
  return gt >= 0 && gt > lt;
}

export function sniffContext(text: string, index: number): ContextType {
  if (inScript(text, index)) {
    return "script";
  }
  if (inAttribute(text, index)) {
    return "html-attr";
  }
  if (inJsonString(text, index)) {
    return "json-string";
  }
  if (inUrl(text, index)) {
    return "url";
  }
  if (inHtmlText(text, index)) {
    return "html-text";
  }
  return "raw";
}
