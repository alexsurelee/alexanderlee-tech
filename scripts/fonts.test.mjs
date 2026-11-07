import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createHash } from 'node:crypto';

const fixture = Buffer.from('wOF2test font');
const files = [{ file: 'Regular.woff2', sha256: createHash('sha256').update(fixture).digest('hex') }];

test('unlicensed checkouts can build, but required fonts fail when absent', async () => {
	const { checkFonts } = await import('./fonts.mjs');
	const dir = mkdtempSync(join(tmpdir(), 'fonts-'));
	try {
		assert.equal(checkFonts(dir, files), false);
		assert.throws(() => checkFonts(dir, files, true), /Missing licensed fonts/);
	} finally { rmSync(dir, { recursive: true }); }
});

test('download validates every file before replacing local fonts', async () => {
	const { downloadFonts, checkFonts } = await import('./fonts.mjs');
	const dir = mkdtempSync(join(tmpdir(), 'fonts-'));
	try {
		await downloadFonts(dir, files, async () => fixture);
		assert.equal(checkFonts(dir, files, true), true);
		await assert.rejects(downloadFonts(dir, files, async () => Buffer.from('error page')), /Invalid font/);
		assert.equal(checkFonts(dir, files, true), true);
		writeFileSync(join(dir, files[0].file), 'corrupt');
		assert.throws(() => checkFonts(dir, files), /Invalid font/);
	} finally { rmSync(dir, { recursive: true }); }
});
