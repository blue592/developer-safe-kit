import test from 'node:test';
import assert from 'node:assert/strict';
import { queryFromNeed, searchRepositories } from './github.js';
import { rank, score } from './rank.js';
import { recommend } from './cli.js';

const repo = (extra = {}) => ({ full_name: 'acme/tool', description: 'A useful tool', stargazers_count: 1000, open_issues_count: 10, language: 'Rust', license: { spdx_id: 'MIT' }, has_wiki: true, pushed_at: new Date().toISOString(), html_url: 'https://github.com/acme/tool', ...extra });

test('query sanitizes input and rejects empty or huge needs', () => {
  assert.equal(queryFromNeed('  markdown parser !!! '), 'markdown parser in:name,description,readme');
  assert.throws(() => queryFromNeed(''), /between/);
  assert.throws(() => queryFromNeed('x'.repeat(301)), /between/);
});

test('search uses GitHub API, bearer token and bounded page size', async () => {
  let request;
  const result = await searchRepositories('rust parser', { token: 'secret', limit: 99, fetcher: async (url, init) => { request = { url, init }; return new Response(JSON.stringify({ total_count: 1, items: [repo()] }), { status: 200 }); } });
  assert.match(request.url, /per_page=30/);
  assert.equal(request.init.headers.authorization, 'Bearer secret');
  assert.equal(result.items.length, 1);
});

test('search hides response body on API errors', async () => {
  await assert.rejects(searchRepositories('tool', { fetcher: async () => new Response('private-secret', { status: 403 }) }), /GitHub search failed/);
});

test('ranking honors language and license preferences', () => {
  const match = repo({ full_name: 'a/match' });
  const other = repo({ full_name: 'b/other', language: 'JavaScript', license: { spdx_id: 'Apache-2.0' } });
  assert.ok(score(match, { language: 'rust', license: 'mit' }) > score(other, { language: 'rust', license: 'mit' }));
  assert.equal(rank([other, match], { language: 'rust', license: 'mit' })[0].repo.full_name, 'a/match');
});

test('recommend returns ranked results without a live network call', async () => {
  const result = await recommend('error tracking', { limit: 2 }, { token: 'dummy', search: async () => ({ total: 2, query: 'x', items: [repo(), repo({ full_name: 'acme/second', stargazers_count: 2 })] }) });
  assert.equal(result.ranked.length, 2);
  assert.equal(result.ranked[0].repo.full_name, 'acme/tool');
});

