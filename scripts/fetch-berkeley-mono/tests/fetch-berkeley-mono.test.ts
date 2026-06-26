// @vitest-environment node
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_BLOB_PREFIX,
  FONT_FILES,
  MIN_FILE_SIZE,
  getMissingFiles,
  runFetchBerkeleyMono,
} from "../lib.mjs";

function createFontDir() {
  return mkdtempSync(join(tmpdir(), "berkeley-mono-test-"));
}

function writeFontFile(fontDir: string, filename: string, size = MIN_FILE_SIZE) {
  writeFileSync(join(fontDir, filename), Buffer.alloc(size, 0x61));
}

function mockBlobPayload(size = MIN_FILE_SIZE) {
  const buffer = Buffer.alloc(size, 0x62);
  return {
    statusCode: 200 as const,
    stream: Readable.toWeb(Readable.from([buffer])),
  };
}

function createExitMock() {
  const exit = vi.fn<(code: number) => void>();
  return exit;
}

describe("getMissingFiles", () => {
  it("returns all files when the font directory is empty", () => {
    const fontDir = createFontDir();

    expect(getMissingFiles(fontDir)).toEqual(FONT_FILES);
  });

  it("returns only absent files when some are present", () => {
    const fontDir = createFontDir();
    writeFontFile(fontDir, FONT_FILES[0]);
    writeFontFile(fontDir, FONT_FILES[2]);

    expect(getMissingFiles(fontDir)).toEqual([FONT_FILES[1], FONT_FILES[3]]);
  });
});

describe("runFetchBerkeleyMono", () => {
  let fontDir: string;

  afterEach(() => {
    if (fontDir) {
      rmSync(fontDir, { recursive: true, force: true });
    }
  });

  it("exits 0 when all font files are already present", async () => {
    fontDir = createFontDir();
    for (const file of FONT_FILES) {
      writeFontFile(fontDir, file);
    }

    const exit = createExitMock();
    const getBlob = vi.fn();
    const log = vi.fn();

    await runFetchBerkeleyMono({ fontDir, exit, getBlob, log });

    expect(exit).toHaveBeenCalledWith(0);
    expect(getBlob).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      "All font files present, skipping download.",
    );
  });

  it("exits 1 on Vercel when the blob token is missing", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const error = vi.fn();

    await runFetchBerkeleyMono({
      fontDir,
      env: { VERCEL: "1" },
      exit,
      error,
    }).catch(() => {});

    expect(exit).toHaveBeenCalledWith(1);
    expect(error).toHaveBeenCalledWith(
      "BLOB_READ_WRITE_TOKEN is required on Vercel.",
    );
  });

  it("warns and exits 0 off Vercel when fonts are missing and there is no token", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const warn = vi.fn();

    await runFetchBerkeleyMono({ fontDir, env: {}, exit, warn });

    expect(exit).toHaveBeenCalledWith(0);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Missing local font files in"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Site will use system monospace."),
    );
  });

  it("downloads only missing files when a token is available", async () => {
    fontDir = createFontDir();
    writeFontFile(fontDir, FONT_FILES[0]);

    const exit = createExitMock();
    const getBlob = vi.fn(async (pathname: string) => {
      expect(pathname.startsWith(`${DEFAULT_BLOB_PREFIX}/`)).toBe(true);
      return mockBlobPayload();
    });

    await runFetchBerkeleyMono({
      fontDir,
      env: { BLOB_READ_WRITE_TOKEN: "test-token" },
      exit,
      getBlob,
    });

    expect(getBlob).toHaveBeenCalledTimes(FONT_FILES.length - 1);
    expect(getBlob).not.toHaveBeenCalledWith(
      `${DEFAULT_BLOB_PREFIX}/${FONT_FILES[0]}`,
      expect.anything(),
    );
    expect(getMissingFiles(fontDir)).toEqual([]);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it("uses BERKELEY_MONO_BLOB_PREFIX when fetching", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const getBlob = vi.fn(async () => mockBlobPayload());

    await runFetchBerkeleyMono({
      fontDir,
      env: {
        BLOB_READ_WRITE_TOKEN: "test-token",
        BERKELEY_MONO_BLOB_PREFIX: "custom-prefix",
      },
      exit,
      getBlob,
    });

    expect(getBlob).toHaveBeenCalledWith(
      `custom-prefix/${FONT_FILES[0]}`,
      expect.objectContaining({
        access: "private",
        token: "test-token",
      }),
    );
  });

  it("exits 1 when blob download fails", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const error = vi.fn();
    const getBlob = vi.fn(async () => null);

    await runFetchBerkeleyMono({
      fontDir,
      env: { BLOB_READ_WRITE_TOKEN: "test-token" },
      exit,
      error,
      getBlob,
    }).catch(() => {});

    expect(exit).toHaveBeenCalledWith(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to download"),
    );
  });

  it("exits 1 when a downloaded file is too small", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const error = vi.fn();
    const getBlob = vi.fn(async () => mockBlobPayload(MIN_FILE_SIZE - 1));

    await runFetchBerkeleyMono({
      fontDir,
      env: { BLOB_READ_WRITE_TOKEN: "test-token" },
      exit,
      error,
      getBlob,
    }).catch(() => {});

    expect(exit).toHaveBeenCalledWith(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("is too small"),
    );
  });

  it("exits 1 on Vercel when files remain missing after fetch attempts", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const error = vi.fn();
    const getBlob = vi.fn(async () => mockBlobPayload());

    await runFetchBerkeleyMono({
      fontDir,
      env: { VERCEL: "1", BLOB_READ_WRITE_TOKEN: "test-token" },
      exit,
      error,
      getBlob,
      existsSyncFn: () => false,
    }).catch(() => {});

    expect(getBlob).toHaveBeenCalledTimes(FONT_FILES.length);
    expect(exit).toHaveBeenCalledWith(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Still missing:"),
    );
  });

  it("writes downloaded bytes to disk", async () => {
    fontDir = createFontDir();
    const exit = createExitMock();
    const getBlob = vi.fn(async () => mockBlobPayload(MIN_FILE_SIZE + 10));

    await runFetchBerkeleyMono({
      fontDir,
      env: { BLOB_READ_WRITE_TOKEN: "test-token" },
      exit,
      getBlob,
      log: () => {},
    });

    const written = readFileSync(join(fontDir, FONT_FILES[0]));
    expect(written.length).toBeGreaterThanOrEqual(MIN_FILE_SIZE);
    expect(written[0]).toBe(0x62);
  });
});
