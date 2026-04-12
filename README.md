# smartcontext

Scan a codebase and format it for LLM context windows — in seconds.

## Quick Start

```bash
# Step 1 — Install globally (one time only)
npm install -g @satvashildesai/smartcontext

# Step 2 — Use from anywhere
sc ./your-project
```

That's it. After the global install, use `sc` from any directory — no need to type the full package name again.

---

## Usage

```bash
sc <directory> [options]

# Full name also works after global install
smartcontext <directory> [options]
```

---

## Options

| Flag                      | Description                                      | Default |
| ------------------------- | ------------------------------------------------ | ------- |
| `-o, --output <path>`     | Write output to a file instead of stdout         | stdout  |
| `-i, --ignore <pattern>`  | Extra ignore pattern, repeatable                 | —       |
| `--format <type>`         | Output format: `xml`, `markdown`, `plain`        | `xml`   |
| `--max-file-size <bytes>` | Skip files larger than this size                 | —       |
| `--copy`                  | Copy output directly to clipboard                | `false` |
| `--dry-run`               | Preview file list and token count without output | `false` |

---

## Examples

```bash
# Preview what would be included — no output generated
sc ./my-project --dry-run

# Scan and copy directly to clipboard — paste straight into any LLM
sc ./my-project --copy

# Scan and save as XML (default format)
sc ./my-project --output context.xml

# Scan and save as Markdown
sc ./my-project --format markdown --output context.md

# Scan and save as plain text
sc ./my-project --format plain --output context.txt

# Ignore extra folders on top of .gitignore
sc ./my-project --ignore "*.test.ts" --ignore "docs"

# Skip files larger than 50KB
sc ./my-project --max-file-size 51200

# Combine options
sc ./my-project --format markdown --ignore dist --output context.md
```

---

## What it does

- Recursively scans your project directory
- Automatically skips `node_modules`, `.git`, binary files, lock files, and secrets like `.env`
- Respects your `.gitignore` patterns
- Detects and skips binary files by content — not just extension
- Estimates token usage against major LLM context windows before you paste anything
- Copies output directly to clipboard with `--copy` — no file needed
- Outputs structured, LLM-ready content in XML, Markdown, or Plain text

### Token estimation

Every scan shows you how much of each model's context window your codebase uses:

```
Context window usage:
  ✅ GPT-4o (128k):        3.8% of context used
  ✅ Claude Sonnet (200k): 2.4% of context used
  ✅ Gemini 1.5 (1M):      0.5% of context used
```

---

## Without global install

If you prefer not to install globally, use `npx` with the full scoped name:

```bash
npx @satvashildesai/smartcontext ./my-project --dry-run
```

Note: `npx sc` and `npx smartcontext` will not work — the short aliases only activate after a global install.

---

## Package

```
npm: @satvashildesai/smartcontext
```
