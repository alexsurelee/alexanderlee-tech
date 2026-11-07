import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const fontDirectory = new URL('../src/assets/fonts/berkeley-mono/', import.meta.url);

export function fontCredentials(env) {
	return {
		account: env.FONT_R2_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID,
		token: env.FONT_R2_API_TOKEN || env.CLOUDFLARE_API_TOKEN,
	};
}

export const fontFiles = [
	{ file: 'BerkeleyMono-Regular.woff2', weight: 400, style: 'normal', sha256: '8b91d4f34790fa02b7886647c9431cd10ac3dadd8c20679874f211e5571f6935' },
	{ file: 'BerkeleyMono-Oblique.woff2', weight: 400, style: 'oblique', sha256: '36a8282307991368624fb52da2f52157be60bd763fa7e2cc2894d5e5b0b7fe2a' },
	{ file: 'BerkeleyMono-Bold.woff2', weight: 700, style: 'normal', sha256: '2ee4b12866e2f11984c9b1c2934a410875b6c608e6c579ff3235eec4ae40d02b' },
	{ file: 'BerkeleyMono-Bold-Oblique.woff2', weight: 700, style: 'oblique', sha256: 'd2783fb3b84efbf4e0aa9572a016d010b2ec60657effcf92fe4379fbf129ea0d' },
];

function validateFont(bytes, font) {
	if (bytes.subarray(0, 4).toString() !== 'wOF2' || createHash('sha256').update(bytes).digest('hex') !== font.sha256) {
		throw new Error(`Invalid font: ${font.file} (expected original licensed WOFF2 file)`);
	}
}

export function checkFonts(directory, files = fontFiles, required = false) {
	const paths = files.map(font => join(directory instanceof URL ? fileURLToPath(directory) : directory, font.file));
	if (!paths.every(path => existsSync(path))) {
		if (required || paths.some(path => existsSync(path))) throw new Error('Missing licensed fonts. Run pnpm fonts:download.');
		return false;
	}
	files.forEach((font, i) => validateFont(readFileSync(paths[i]), font));
	return true;
}

export async function downloadFonts(directory, files, getObject) {
	const downloads = await Promise.all(files.map(async font => {
		const bytes = Buffer.from(await getObject(font.file));
		validateFont(bytes, font);
		return bytes;
	}));
	mkdirSync(directory, { recursive: true });
	files.forEach((font, i) => writeFileSync(join(directory instanceof URL ? fileURLToPath(directory) : directory, font.file), downloads[i]));
}
