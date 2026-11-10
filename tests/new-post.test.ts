import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, type TestContext } from 'node:test';

const script = fileURLToPath(new URL('../scripts/new-post.ts', import.meta.url));

async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), 'new-post-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return {
    directory: join(root, 'src/content/blog'),
    run: (...args: string[]) => spawnSync(process.execPath, [
      '--import', import.meta.resolve('tsx'), script, ...args,
    ], { cwd: root, encoding: 'utf8' }),
  };
}

test('creates a blank post with safely quoted frontmatter and a title-derived filename', async (t) => {
  const { directory, run } = await fixture(t);
  const result = run('My "first": post');
  assert.equal(result.status, 0, result.stderr);
  const content = await readFile(join(directory, 'my-first-post.md'), 'utf8');
  assert.match(content, /^---\ntitle: "My \\"first\\": post"\ndescription: ""\nstatus: draft\ncreatedDate: "\d{4}-\d{2}-\d{2}"\n/);
  assert.doesNotMatch(content, /^publishedDate:|^pubDate:/m);
  assert.match(content, /# updatedDate:/);
  assert.match(content, /# heroImage:/);
  assert.match(content, /\n---\n\n$/);
  assert.match(result.stdout, /src\/content\/blog\/my-first-post.md/);
});

test('requires a title when no interactive terminal is available', async (t) => {
  const { directory, run } = await fixture(t);
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /title/i);
  await assert.rejects(readdir(directory), { code: 'ENOENT' });
});

test('refuses to replace existing Markdown or MDX posts', async (t) => {
  const { directory, run } = await fixture(t);
  await mkdir(directory, { recursive: true });
  for (const extension of ['md', 'mdx']) {
    const path = join(directory, `existing.${extension}`);
    await writeFile(path, 'Original content');
    const result = run('Existing');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /already exists/);
    assert.equal(await readFile(path, 'utf8'), 'Original content');
    assert.deepEqual(await readdir(directory), [`existing.${extension}`]);
    await rm(path);
  }
});

test('rejects titles without letters or numbers without creating a file', async (t) => {
  const { directory, run } = await fixture(t);
  for (const title of ['', '   ', '../../', '!!!']) {
    const result = run(title);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /letter or number/);
  }
  await assert.rejects(readdir(directory), { code: 'ENOENT' });
});

test('shows CLI help without creating a post', async (t) => {
  const { directory, run } = await fixture(t);
  const result = run('--help');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Create a blank blog entry/);
  assert.match(result.stdout, /title/);
  await assert.rejects(readdir(directory), { code: 'ENOENT' });
});

test('rejects extra arguments without creating a post', async (t) => {
  const { directory, run } = await fixture(t);
  const result = run('My post', 'extra');
  assert.equal(result.status, 1);
  await assert.rejects(readdir(directory), { code: 'ENOENT' });
});
