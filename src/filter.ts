import path from "path";
import { readFileSync, existsSync } from "fs";
import ignore, { type Ignore } from "ignore";
import { isBinaryFile } from "isbinaryfile";
import {
  DEFAULT_IGNORE_DIRS,
  DEFAULT_IGNORE_EXTENSIONS,
  DEFAULT_IGNORE_FILES,
} from "./defaults.js";

export class FilterEngine {
  private ig: Ignore;
  private rootDir: string;
  private extraIgnore: string[];

  constructor(rootDir: string, extraPatterns: string[] = []) {
    this.rootDir = rootDir;
    this.extraIgnore = extraPatterns;
    this.ig = this.buildIgnoreInstance();
  }

  private buildIgnoreInstance(): Ignore {
    const ig = ignore();

    // Load .gitignore from the project root if it exists
    const gitignorePath = path.join(this.rootDir, ".gitignore");
    if (existsSync(gitignorePath)) {
      const content = readFileSync(gitignorePath, "utf-8");
      ig.add(content);
    }

    // Add any extra patterns passed via --ignore flags
    if (this.extraIgnore.length > 0) {
      ig.add(this.extraIgnore);
    }

    return ig;
  }

  // Should we skip this directory entirely without even opening it?
  shouldIgnoreDir(absolutePath: string): boolean {
    const name = path.basename(absolutePath);

    // Layer 1: hardcoded directory blacklist
    if (DEFAULT_IGNORE_DIRS.has(name)) return true;

    // Layer 2: .gitignore patterns
    const relativePath = path.relative(this.rootDir, absolutePath);
    if (relativePath && this.ig.ignores(relativePath)) return true;

    return false;
  }

  // Should we skip this file? (sync checks only — binary check is separate)
  shouldIgnoreFile(absolutePath: string): boolean {
    const name = path.basename(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    // Layer 1a: hardcoded filename blacklist
    if (DEFAULT_IGNORE_FILES.has(name)) return true;

    // Layer 1b: hardcoded extension blacklist
    if (DEFAULT_IGNORE_EXTENSIONS.has(ext)) return true;

    // Layer 2: .gitignore patterns
    const relativePath = path.relative(this.rootDir, absolutePath);
    if (relativePath && this.ig.ignores(relativePath)) return true;

    return false;
  }

  // Async binary content check — run this last, only on files that passed above
  async isBinary(absolutePath: string): Promise<boolean> {
    try {
      return await isBinaryFile(absolutePath);
    } catch {
      // If we can't read it, treat it as binary — skip it safely
      return true;
    }
  }
}
