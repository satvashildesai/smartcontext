import path from "path";
import { writeFileSync } from "fs";
import type { ScanResult, OutputFormat } from "./types.js";

export function formatOutput(result: ScanResult, format: OutputFormat): string {
  switch (format) {
    case "xml":
      return formatXML(result);
    case "markdown":
      return formatMarkdown(result);
    case "plain":
      return formatPlain(result);
  }
}

export function writeOutput(content: string, outputPath: string): void {
  try {
    writeFileSync(outputPath, content, "utf-8");
    console.log(`\nOutput written to: ${outputPath}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: could not write output file — ${message}`);
    process.exit(1);
  }
}

// ─── XML Formatter ───────────────────────────────────────────────────────────

function formatXML(result: ScanResult): string {
  const parts: string[] = [];

  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<codebase>`);

  // Metadata block
  parts.push(`  <metadata>`);
  parts.push(`    <root>${escapeXML(result.rootDir)}</root>`);
  parts.push(`    <file_count>${result.files.length}</file_count>`);
  parts.push(`    <total_tokens>${result.totalTokens}</total_tokens>`);
  parts.push(`  </metadata>`);

  // ASCII tree block
  parts.push(`  <structure>`);
  parts.push(`<![CDATA[`);
  parts.push(buildTree(result));
  parts.push(`]]>`);
  parts.push(`  </structure>`);

  // File contents
  for (const file of result.files) {
    parts.push(`  <file>`);
    parts.push(`    <path>${escapeXML(file.relativePath)}</path>`);
    parts.push(`    <tokens>${file.tokenCount}</tokens>`);
    parts.push(`    <content>`);
    parts.push(`<![CDATA[`);
    parts.push(escapeCDATA(file.content));
    parts.push(`]]>`);
    parts.push(`    </content>`);
    parts.push(`  </file>`);
  }

  parts.push(`</codebase>`);

  return parts.join("\n");
}

// ─── Markdown Formatter ───────────────────────────────────────────────────────

function formatMarkdown(result: ScanResult): string {
  const parts: string[] = [];

  parts.push(`# Codebase Scan`);
  parts.push(`\n**Root:** ${result.rootDir}`);
  parts.push(`**Files:** ${result.files.length}`);
  parts.push(`**Total tokens:** ${result.totalTokens.toLocaleString()}`);

  parts.push(`\n## Project Structure\n`);
  parts.push("```");
  parts.push(buildTree(result));
  parts.push("```");

  for (const file of result.files) {
    const ext = path.extname(file.relativePath).replace(".", "");
    parts.push(`\n## ${file.relativePath}`);
    parts.push(`*${file.tokenCount} tokens*\n`);
    parts.push(`\`\`\`${ext}`);
    parts.push(file.content);
    parts.push("```");
  }

  return parts.join("\n");
}

// ─── Plain Formatter ──────────────────────────────────────────────────────────

function formatPlain(result: ScanResult): string {
  const parts: string[] = [];

  parts.push(`CODEBASE SCAN`);
  parts.push(`Root: ${result.rootDir}`);
  parts.push(
    `Files: ${
      result.files.length
    } | Tokens: ${result.totalTokens.toLocaleString()}`
  );
  parts.push(`\nPROJECT STRUCTURE\n`);
  parts.push(buildTree(result));

  for (const file of result.files) {
    parts.push(`\n${"─".repeat(60)}`);
    parts.push(`FILE: ${file.relativePath} (${file.tokenCount} tokens)`);
    parts.push("─".repeat(60));
    parts.push(file.content);
  }

  return parts.join("\n");
}

// ─── ASCII Tree Builder ───────────────────────────────────────────────────────

function buildTree(result: ScanResult): string {
  // Build a nested map representing the directory tree
  const tree: TreeNode = {
    name: path.basename(result.rootDir),
    children: new Map(),
  };

  for (const file of result.files) {
    const parts = file.relativePath.split(/[\\/]/);
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (!part) continue;

      const isFile = i === parts.length - 1;

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          children: new Map(),
          isFile,
        });
      }
      current = current.children.get(part)!;
    }
  }

  return renderTree(tree, "");
}

function renderTree(node: TreeNode, prefix: string): string {
  const lines: string[] = [];

  if (prefix === "") {
    // Root node
    lines.push(node.name + "/");
  }

  const children = [...node.children.values()];

  children.forEach((child, index) => {
    const isLast = index === children.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";
    const label = child.isFile ? child.name : child.name + "/";

    lines.push(prefix + connector + label);

    if (!child.isFile) {
      lines.push(renderTree(child, prefix + childPrefix));
    }
  });

  return lines.filter(Boolean).join("\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Escape characters that would break XML attribute/element values
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The only string that breaks CDATA is ']]>' — split it across two CDATA sections
function escapeCDATA(str: string): string {
  return str.replace(/]]>/g, "]]]]><![CDATA[>");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface TreeNode {
  name: string;
  children: Map<string, TreeNode>;
  isFile?: boolean;
}
