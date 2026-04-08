import { existsSync, statSync, accessSync, constants } from "fs";
import {
  ScanError,
  DirectoryNotFoundError,
  PermissionError,
} from "./errors.js";

export function validateRootDir(dir: string): void {
  // Check existence
  if (!existsSync(dir)) {
    throw new DirectoryNotFoundError(dir);
  }

  // Check it's actually a directory, not a file
  const stat = statSync(dir);

  if (!stat.isDirectory()) {
    throw new ScanError(`Path is not a directory: ${dir}`);
  }

  // Check read permission
  try {
    accessSync(dir, constants.R_OK);
  } catch {
    throw new PermissionError(dir);
  }
}
