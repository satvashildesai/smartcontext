export interface ScannerOptions {
  output?: string;
  ignore?: string[];
  dryRun: boolean;
  maxFileSize?: number;
}

export interface FileEntry {
  absolutePath: string;
  relativePath: string;
  content: string;
  tokenCount: number;
}

export interface ScanResult {
  rootDir: string;
  files: FileEntry[];
  totalTokens: number;
  skippedFiles: string[];
}

export type OutputFormat = "xml" | "markdown" | "plain";
