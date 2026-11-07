import { downloadFonts, fontDirectory, fontFiles } from './fonts.mjs';

const account = process.env.FONT_R2_ACCOUNT_ID;
const token = process.env.FONT_R2_API_TOKEN;
const bucket = process.env.FONT_R2_BUCKET || 'alexanderlee-tech-fonts';
if (!account || !token) throw new Error('Set FONT_R2_ACCOUNT_ID and FONT_R2_API_TOKEN to download licensed fonts.');

await downloadFonts(fontDirectory, fontFiles, async file => {
	const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/r2/buckets/${encodeURIComponent(bucket)}/objects/berkeley-mono/${file}`, {
		headers: { Authorization: `Bearer ${token}` },
		signal: AbortSignal.timeout(30_000),
	});
	if (!response.ok) throw new Error(`Font download failed for ${file}: HTTP ${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
});
console.log('Downloaded and verified all four Berkeley Mono fonts.');
