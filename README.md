# smartcontext

Scan a codebase and format it for LLM context windows.

## Usage

```bash
npx smartcontext <directory> [options]
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
npx smartcontext ./

# Scan with extra ignores, save to file
npx smartcontext ./my-project --ignore "*.test.ts" --output context.xml

# Check token count before pasting into an LLM
npx smartcontext ./my-project --dry-run
```
