class ResurfaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResurfaceError";
  }
}

export class SDKNotInitializedError extends ResurfaceError {
  constructor() {
    super("Backend SDK is not initialized");
    this.name = "SDKNotInitializedError";
  }
}

export class NotFoundError extends ResurfaceError {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ResurfaceError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
