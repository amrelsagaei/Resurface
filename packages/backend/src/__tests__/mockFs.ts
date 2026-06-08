import { vi } from "vitest";

const fileSystem = new Map<string, string>();

export function createMockFs() {
  fileSystem.clear();

  return {
    access: vi.fn((path: string) => {
      if (!fileSystem.has(path)) {
        return Promise.reject(new Error(`ENOENT: ${path}`));
      }
      return Promise.resolve();
    }),
    readFile: vi.fn((path: string) => Promise.resolve(fileSystem.get(path))),
    writeFile: vi.fn((path: string, data: string) => {
      fileSystem.set(path, data);
      return Promise.resolve();
    }),
    rename: vi.fn((oldPath: string, newPath: string) => {
      const content = fileSystem.get(oldPath);
      if (content !== undefined) {
        fileSystem.set(newPath, content);
        fileSystem.delete(oldPath);
      }
      return Promise.resolve();
    }),
    mkdir: vi.fn(() => Promise.resolve()),
    rm: vi.fn((path: string) => {
      fileSystem.delete(path);
      return Promise.resolve();
    }),
    _store: fileSystem,
  };
}
