// Directories to always skip entirely
// Skipping at directory level means we never even open them
export const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".turbo",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
]);

// File extensions that are always binary or useless to an LLM
export const DEFAULT_IGNORE_EXTENSIONS = new Set([
  // images
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".svg",
  ".webp",
  // video/audio
  ".mp4",
  ".mp3",
  ".wav",
  ".mov",
  ".avi",
  // archives
  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",
  // binaries
  ".exe",
  ".bin",
  ".dll",
  ".so",
  ".dylib",
  // compiled
  ".class",
  ".pyc",
  ".o",
  // fonts
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
]);

// Specific filenames to always skip — secrets, lockfiles, etc.
export const DEFAULT_IGNORE_FILES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]);
