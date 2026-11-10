import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blogPostSchema, isPublishedPost } from '../src/blog/post.ts';

const common = { title: 'A post', description: '', createdDate: '2026-01-01' };

test('drafts track creation without a publication date', () => {
  const post = blogPostSchema.parse({ ...common, status: 'draft' });
  assert.equal(post.status, 'draft');
  assert.deepEqual(post.createdDate, new Date('2026-01-01'));
  assert.equal(post.publishedDate, undefined);
  assert.equal(isPublishedPost({ data: post }), false);
});

test('published posts require and parse their publication date', () => {
  const post = blogPostSchema.parse({ ...common, status: 'published', publishedDate: '2026-02-01' });
  assert.equal(post.status, 'published');
  assert.deepEqual(post.publishedDate, new Date('2026-02-01'));
  assert.equal(isPublishedPost({ data: post }), true);
});

test('rejects missing or contradictory publication states', () => {
  for (const fields of [
    {}, { status: 'scheduled' }, { status: 'published' },
    { status: 'draft', publishedDate: '2026-02-01' },
  ]) {
    assert.equal(blogPostSchema.safeParse({ ...common, ...fields }).success, false);
  }
});

test('requires a valid creation date and valid optional update dates', () => {
  for (const createdDate of [undefined, null, '', 'invalid']) {
    assert.equal(blogPostSchema.safeParse({ ...common, status: 'draft', createdDate }).success, false);
  }
  assert.equal(blogPostSchema.safeParse({ ...common, status: 'draft', updatedDate: 'invalid' }).success, false);
});

test('rejects publication before creation and updates before creation or publication', () => {
  for (const fields of [
    { status: 'published', publishedDate: '2025-12-31' },
    { status: 'draft', updatedDate: '2025-12-31' },
    { status: 'published', publishedDate: '2026-02-01', updatedDate: '2026-01-15' },
  ]) {
    assert.equal(blogPostSchema.safeParse({ ...common, ...fields }).success, false);
  }
  assert.equal(blogPostSchema.safeParse({
    ...common, status: 'published', publishedDate: common.createdDate, updatedDate: common.createdDate,
  }).success, true);
});
