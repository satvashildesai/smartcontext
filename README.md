# smartcontext

Scan a codebase and format it for LLM context windows.

## Installation

```bash
# Run directly without installing
npx @satvashildesai/smartcontext <directory> [options]

# Or use the short alias
npx smartcontext <directory> [options]

# Or use the short alias
npx sc <directory> [options]

# Or install globally
npm install -g @satvashildesai/smartcontext
smartcontext <directory> [options]
```

## Options

| Flag                      | Description                         | Default |
| ------------------------- | ----------------------------------- | ------- |
| `-o, --output <path>`     | Write output to file                | stdout  |
| `-i, --ignore <pattern>`  | Extra ignore pattern (repeatable)   | —       |
| `--format <type>`         | Output format: xml, markdown, plain | xml     |
| `--max-file-size <bytes>` | Skip files larger than this         | —       |
| `--dry-run`               | Show file list and token count only | false   |

## Examples

```bash
# Scan current directory, output XML
npx @satvashildesai/smartcontext ./

# Use short alias
npx sc ./

# Scan with extra ignores, save to file
npx sc ./my-project --ignore "*.test.ts" --output context.xml

# Check token count before pasting into an LLM
npx sc ./my-project --dry-run

# Output as markdown
npx sc ./my-project --format markdown --output context.md

# Output as plain text
npx sc ./my-project --format plain --output context.txt
```
