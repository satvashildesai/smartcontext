export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}

export class DirectoryNotFoundError extends ScanError {
  constructor(dir: string) {
    super(`Directory not found: ${dir}`);
    this.name = "DirectoryNotFoundError";
  }
}

export class PermissionError extends ScanError {
  constructor(target: string) {
    super(`Permission denied: ${target}`);
    this.name = "PermissionError";
  }
}
