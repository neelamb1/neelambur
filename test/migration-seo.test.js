import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  pageCanonical,
  pageHreflangLinks
} from '../src/_data/eleventyComputed.js';
import Sitemap from '../src/sitemap.11ty.js';

const site = {
  site: { defaultLanguage: 'en' },
  hosting: { canonicalBaseUrl: 'https://blog.neelambur.com', pathPrefix: '/' }
};

const posts = [
  {
    id: '01K00000000000000000000000',
    source: 'content/posts/article/index.en.md',
    language: 'en',
    pageUrl: 'https://blog.neelambur.com/en/article/',
    publicationState: 'published',
    frontmatter: { publishAfterDate: '2026-07-14' }
  },
  {
    id: '01K00000000000000000000000',
    source: 'content/posts/article/index.ta.md',
    language: 'ta',
    pageUrl: 'https://blog.neelambur.com/ta/article/',
    publicationState: 'published',
    frontmatter: { publishAfterDate: '2026-07-14' }
  },
  {
    id: '01K00000000000000000000001',
    source: 'content/posts/future/index.en.md',
    language: 'en',
    pageUrl: 'https://blog.neelambur.com/en/future/',
    publicationState: 'not-emitted',
    frontmatter: { publishAfterDate: '2026-09-14' }
  }
];

test('sitemap preserves root and language landing pages alongside published articles', () => {
  const sitemap = new Sitemap().render({ buildManifest: { posts }, site });

  assert.match(sitemap, /<loc>https:\/\/blog\.neelambur\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/blog\.neelambur\.com\/en\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/blog\.neelambur\.com\/ta\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/blog\.neelambur\.com\/en\/article\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/blog\.neelambur\.com\/ta\/article\/<\/loc>/);
  assert.doesNotMatch(sitemap, /\/future\//);
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 5);
});

test('robots advertises the canonical production sitemap', async () => {
  const robots = await readFile(new URL('../static/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /^Sitemap: https:\/\/blog\.neelambur\.com\/sitemap\.xml$/m);
});

test('landing pages receive self-canonicals and reciprocal language alternates', () => {
  const languages = ['en', 'ta'];
  assert.equal(pageCanonical({ page: { url: '/' }, site }), 'https://blog.neelambur.com/');
  assert.equal(
    pageCanonical({ page: { url: '/ta/' }, site }),
    'https://blog.neelambur.com/ta/'
  );
  assert.equal(pageCanonical({ page: { url: '/404.html' }, site }), null);
  assert.equal(pageCanonical({ page: {}, site }), null);
  assert.deepEqual(pageHreflangLinks({ languages, page: { url: '/ta/' }, site }), [
    { hreflang: 'en', href: 'https://blog.neelambur.com/en/' },
    { hreflang: 'ta', href: 'https://blog.neelambur.com/ta/' },
    { hreflang: 'x-default', href: 'https://blog.neelambur.com/en/' }
  ]);
  assert.deepEqual(pageHreflangLinks({ languages, page: { url: '/' }, site }), [
    { hreflang: 'en', href: 'https://blog.neelambur.com/en/' },
    { hreflang: 'ta', href: 'https://blog.neelambur.com/ta/' },
    { hreflang: 'x-default', href: 'https://blog.neelambur.com/' }
  ]);
});
