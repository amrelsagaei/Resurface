const NON_TEXT_PREFIXES = ["image/", "audio/", "video/", "font/"];

const NON_TEXT_TYPES = [
  "application/octet-stream",
  "application/pdf",
  "application/zip",
  "application/gzip",
  "application/x-protobuf",
  "application/wasm",
];

export function isTextContentType(contentType: string | undefined): boolean {
  if (contentType === undefined || contentType === "") {
    return true;
  }
  const value = contentType.toLowerCase();
  if (NON_TEXT_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return false;
  }
  if (NON_TEXT_TYPES.some((type) => value.startsWith(type))) {
    return false;
  }
  return true;
}
