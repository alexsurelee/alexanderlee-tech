import { createWriteStream, existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const FONT_FILES = [
  "BerkeleyMono-Regular.woff2",
  "BerkeleyMono-Oblique.woff2",
  "BerkeleyMono-Bold.woff2",
  "BerkeleyMono-Bold-Oblique.woff2",
];

export const MIN_FILE_SIZE = 1024;
export const DEFAULT_BLOB_PREFIX = "berkeley-mono";

export function getMissingFiles(fontDir, existsSyncFn = existsSync) {
  return FONT_FILES.filter((file) => !existsSyncFn(join(fontDir, file)));
}

function readEnv(env) {
  return {
    blobPrefix: env.BERKELEY_MONO_BLOB_PREFIX ?? DEFAULT_BLOB_PREFIX,
    isVercel: env.VERCEL === "1",
    token: env.BLOB_READ_WRITE_TOKEN,
  };
}

function createFail(error, exit) {
  return (message) => {
    error(message);
    exit(1);
    throw new Error(message);
  };
}

async function downloadFontFile({
  filename,
  fontDir,
  blobPrefix,
  token,
  getBlob,
  fail,
  log,
  statFn,
  pipelineFn,
  createWriteStreamFn,
}) {
  if (!getBlob) {
    fail("getBlob is required to download font files.");
  }

  const pathname = `${blobPrefix}/${filename}`;
  const destPath = join(fontDir, filename);

  log(`Downloading ${pathname}…`);

  const result = await getBlob(pathname, {
    access: "private",
    ...(token ? { token } : {}),
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    fail(`Failed to download ${pathname}`);
  }

  await pipelineFn(
    Readable.fromWeb(result.stream),
    createWriteStreamFn(destPath),
  );

  const { size } = await statFn(destPath);
  if (size < MIN_FILE_SIZE) {
    fail(`Downloaded ${filename} is too small (${size} bytes)`);
  }

  log(`Saved ${filename} (${size} bytes)`);
}

function exitWhenFontsComplete(fontDir, existsSyncFn, log, exit) {
  const missing = getMissingFiles(fontDir, existsSyncFn);
  if (missing.length === 0) {
    log("All font files present, skipping download.");
    exit(0);
    return true;
  }

  return false;
}

function requireVercelToken(isVercel, token, fail) {
  if (isVercel && !token) {
    fail("BLOB_READ_WRITE_TOKEN is required on Vercel.");
  }
}

async function resolveMissingFonts({
  missing,
  token,
  fontDir,
  warn,
  downloadFile,
}) {
  if (token) {
    for (const filename of missing) {
      await downloadFile(filename);
    }
    return;
  }

  warn(
    `Missing local font files in ${fontDir}. Add your licensed .woff2 files, or run with BLOB_READ_WRITE_TOKEN to fetch from Blob.`,
  );
}

function finishWithMissingFonts({
  fontDir,
  existsSyncFn,
  isVercel,
  fail,
  warn,
  log,
  exit,
}) {
  const stillMissing = getMissingFiles(fontDir, existsSyncFn);
  if (stillMissing.length === 0) {
    log("Done.");
    exit(0);
    return;
  }

  const message = `Still missing: ${stillMissing.join(", ")}`;
  if (isVercel) {
    fail(message);
  }

  warn(`${message}. Site will use system monospace.`);
  exit(0);
}

const defaultLog = (message) => console.log(`fetch-berkeley-mono: ${message}`);
const defaultWarn = (message) =>
  console.warn(`fetch-berkeley-mono: ${message}`);
const defaultError = (message) =>
  console.error(`fetch-berkeley-mono: ${message}`);

const DEFAULT_DEPS = {
  env: process.env,
  mkdirFn: mkdir,
  existsSyncFn: existsSync,
  statFn: stat,
  createWriteStreamFn: createWriteStream,
  pipelineFn: pipeline,
  exit: (code) => process.exit(code),
  log: defaultLog,
  warn: defaultWarn,
  error: defaultError,
};

function createDefaultDeps(overrides) {
  return { ...DEFAULT_DEPS, ...overrides };
}

/**
 * @param {object} deps
 * @param {string} deps.fontDir
 * @param {NodeJS.ProcessEnv} [deps.env]
 * @param {(pathname: string, options: object) => Promise<object | null>} [deps.getBlob]
 * @param {typeof mkdir} [deps.mkdirFn]
 * @param {typeof existsSync} [deps.existsSyncFn]
 * @param {typeof stat} [deps.statFn]
 * @param {typeof createWriteStream} [deps.createWriteStreamFn]
 * @param {typeof pipeline} [deps.pipelineFn]
 * @param {(code: number) => void} [deps.exit]
 * @param {(message: string) => void} [deps.log]
 * @param {(message: string) => void} [deps.warn]
 * @param {(message: string) => void} [deps.error]
 */
export async function runFetchBerkeleyMono(overrides) {
  const {
    fontDir,
    env,
    getBlob,
    mkdirFn,
    existsSyncFn,
    statFn,
    pipelineFn,
    createWriteStreamFn,
    exit,
    log,
    warn,
    error,
  } = createDefaultDeps(overrides);
  const { blobPrefix, isVercel, token } = readEnv(env);
  const fail = createFail(error, exit);
  const downloadFile = (filename) =>
    downloadFontFile({
      filename,
      fontDir,
      blobPrefix,
      token,
      getBlob,
      fail,
      log,
      statFn,
      pipelineFn,
      createWriteStreamFn,
    });

  await mkdirFn(fontDir, { recursive: true });

  if (exitWhenFontsComplete(fontDir, existsSyncFn, log, exit)) {
    return;
  }

  const missing = getMissingFiles(fontDir, existsSyncFn);
  requireVercelToken(isVercel, token, fail);
  await resolveMissingFonts({ missing, token, fontDir, warn, downloadFile });
  finishWithMissingFonts({
    fontDir,
    existsSyncFn,
    isVercel,
    fail,
    warn,
    log,
    exit,
  });
}
