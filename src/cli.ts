import { Command } from "commander";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import type { ScannerOptions } from "./types.js";
import { runScan } from "./scanner.js";
import { formatOutput, writeOutput } from "./formatter.js";

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
    .action(async (directory: string, scannerOptions: ScannerOptions) => {
      const resolvedDir = path.resolve(directory);

      const result = await runScan(resolvedDir, scannerOptions);

      console.log(`\nScan complete:`);
      console.log(`  Files included: ${result.files.length}`);
      console.log(`  Files skipped:  ${result.skippedFiles.length}`);
      console.log(`  Total tokens:   ${result.totalTokens.toLocaleString()}`);
      console.log(`\nContext window usage:`);
      console.log(describeTokenCount(result.totalTokens));

      if (!scannerOptions.dryRun) {
        const output = formatOutput(result, scannerOptions.format);

        if (scannerOptions.output) {
          writeOutput(output, scannerOptions.output);
        } else {
          // Print to stdout if no output file specified
          console.log("\n" + output);
        }
      }

      if (scannerOptions.dryRun) {
        console.log("\nFiles that would be included:");
        result.files.forEach((f) =>
          console.log(`  ${f.relativePath} (${f.tokenCount} tokens)`)
        );
      }
    });

  program.parse(process.argv);
}

// Collector function — called once per --ignore flag
// Each new value is pushed into the accumulated array
function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

// Utility to describe how much percent context window we will use.
function describeTokenCount(total: number): string {
  const limits = [
    { name: "GPT-4o (128k)", limit: 128_000 },
    { name: "Claude Sonnet (200k)", limit: 200_000 },
    { name: "Gemini 1.5 (1M)", limit: 1_000_000 },
  ];

  const lines = limits.map(({ name, limit }) => {
    const percent = ((total / limit) * 100).toFixed(1);
    const fits = total <= limit ? "✅" : "❌";
    return `  ${fits} ${name}: ${percent}% of context used`;
  });

  return lines.join("\n");
}
