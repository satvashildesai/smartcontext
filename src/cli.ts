import { Command } from "commander";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import type { ScannerOptions } from "./types.js";

// ESM doesn't have __dirname — this is the modern replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from package.json without hardcoding it
const pkg = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf-8")
);

export function runCLI(): void {
  const program = new Command();

  program
    .name("smartcontext")
    .description("Scan a codebase and format it for LLM context windows")
    .version(pkg.version)
    // Positional argument — the target directory to scan
    .argument("<directory>", "path to the project directory to scan")
    // Named options
    .option("-o, --output <path>", "write output to a file instead of stdout")
    .option(
      "-i, --ignore <pattern>",
      "extra ignore pattern (repeatable)",
      collect,
      []
    )
    .option(
      "--max-file-size <bytes>",
      "skip files larger than this size in bytes",
      parseInt
    )
    .option(
      "--dry-run",
      "print file list and token count without outputting content",
      false
    )
    .option("--format <type>", "output format", "xml")
    .action((directory: string, scannerOptions: ScannerOptions) => {
      const resolvedDir = path.resolve(directory);

      console.log("Target directory:", resolvedDir);
      console.log("Options:", scannerOptions);
    });

  program.parse(process.argv);
}

// Collector function — called once per --ignore flag
// Each new value is pushed into the accumulated array
function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
