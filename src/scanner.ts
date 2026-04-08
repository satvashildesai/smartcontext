import path from "path";
import { readdirSync, readFileSync, statSync } from "fs";
import { encode } from "gpt-tokenizer";
import { FilterEngine } from "./filter.js";
import type { ScannerOptions, ScanResult, FileEntry } from "./types.js";

function warn(message: string): void {
  console.warn(`  ⚠ ${message}`);
}

export async function runScan(
  rootDir: string,
  options: ScannerOptions
): Promise<ScanResult> {
  const filter = new FilterEngine(rootDir, options.ignore ?? []);

  const files: FileEntry[] = [];
  const skippedFiles: string[] = [];

  // Kick off recursive traversal
  await walk(rootDir, rootDir, filter, options, files, skippedFiles);

  const totalTokens = files.reduce((sum, f) => sum + f.tokenCount, 0);

  return {
    rootDir,
    files,
    totalTokens,
    skippedFiles,
  };
}

async function walk(
  currentDir: string,
  rootDir: string,
  filter: FilterEngine,
  options: ScannerOptions,
  files: FileEntry[],
  skippedFiles: string[]
): Promise<void> {
  let entries;

  try {
    entries = readdirSync(currentDir, { withFileTypes: true });
  } catch (err) {
    // If we can't read a directory (permissions etc), warn and skip
    warn(`Could not read directory: ${path.relative(rootDir, currentDir)}`);
    return;
  }

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (filter.shouldIgnoreDir(absolutePath)) {
        skippedFiles.push(absolutePath);
        continue;
      }
      // Recurse into approved directory
      await walk(absolutePath, rootDir, filter, options, files, skippedFiles);
      continue;
    }

    if (!entry.isFile()) continue; // skip symlinks, sockets, etc.

    // Get stat once — reuse it for size check, don't call it again downstream
    let stat;
    try {
      stat = statSync(absolutePath);
    } catch {
      warn(`Could not stat file: ${path.relative(rootDir, absolutePath)}`);
      skippedFiles.push(absolutePath);
      continue;
    }

    // Layer 1 & 2 checks (sync)
    if (filter.shouldIgnoreFile(absolutePath)) {
      skippedFiles.push(absolutePath);
      continue;
    }

    // Max file size check
    if (options.maxFileSize && stat.size > options.maxFileSize) {
      skippedFiles.push(absolutePath);
      continue;
    }

    // Layer 3: binary content check (async)
    if (await filter.isBinary(absolutePath)) {
      skippedFiles.push(absolutePath);
      continue;
    }

    // File passed all filters — read it
    let content: string;
    try {
      content = readFileSync(absolutePath, "utf-8");
    } catch {
      // Non UTF-8 encoding or other read error — skip safely
      warn(
        `Could not read file (encoding?): ${path.relative(
          rootDir,
          absolutePath
        )}`
      );
      skippedFiles.push(absolutePath);
      continue;
    }

    const relativePath = path.relative(rootDir, absolutePath);
    const tokenCount = encode(content).length;

    files.push({
      absolutePath,
      relativePath,
      content,
      tokenCount,
    });
  }
}
