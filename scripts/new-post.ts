import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

try {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    throw new Error('Usage: pnpm new:post "Post title"');
  }

  const title = (args[0] ?? 'Untitled post').trim();
  const slug = title.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  if (!slug) {
    throw new Error('The title must contain at least one letter or number.');
  }

  const directory = join('src', 'content', 'blog');
  const path = join(directory, `${slug}.md`);
  // Markdown and MDX filenames share the same collection ID.
  for (const extension of ['md', 'mdx']) {
    const existing = join(directory, `${slug}.${extension}`);
    const exists = await access(existing).then(() => true, (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return false;
      throw error;
    });
    if (exists) throw new Error(`Post already exists: ${existing}`);
  }

  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')].join('-');
  const content = [
    '---',
    `title: ${JSON.stringify(title)}`,
    'description: ""',
    `pubDate: "${date}"`,
    `# updatedDate: "${date}"`,
    '# heroImage: "../../assets/your-image.jpg"',
    '---',
    '',
    '',
  ].join('\n');

  await mkdir(directory, { recursive: true });
  // Exclusive creation also protects against concurrent runs for the same title.
  await writeFile(path, content, { flag: 'wx' });
  console.log(`Created ${path}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
