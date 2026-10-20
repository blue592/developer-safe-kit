#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { searchRepositories } from './github.js';
import { formatResult, rank } from './rank.js';

const HELP = `oss-scout — GitHub open-source recommendations

  oss-scout "a self-hosted error tracking tool for Node.js"
  oss-scout "a markdown parser" --language rust --license mit --limit 5
  oss-scout --interactive

Set GITHUB_TOKEN for a higher GitHub API limit. Results are recommendations;
review each project's code, security, license, maintenance and fit yourself.
`;

function options(args) {
  const positional = [];
  const out = { limit: 10 };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--interactive' || arg === '-i') out.interactive = true;
    else if (['--language', '--license', '--limit'].includes(arg)) {
      const value = args[++i];
      if (!value) throw new Error(`${arg} needs a value.`);
      if (arg === '--limit') out.limit = Number(value);
      else out[arg.slice(2)] = value;
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }
  out.need = positional.join(' ');
  return out;
}

export async function recommend(need, preferences = {}, deps = {}) {
  const result = await (deps.search || searchRepositories)(need, { token: deps.token ?? process.env.GITHUB_TOKEN, limit: preferences.limit ?? 10, fetcher: deps.fetcher });
  const ranked = rank(result.items, preferences);
  return { ...result, ranked };
}

export async function main(args = process.argv.slice(2), io = console) {
  const opts = options(args);
  if (opts.help) { io.log(HELP); return 0; }
  let need = opts.need;
  if (opts.interactive) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try { need = await rl.question('What do you need? '); } finally { rl.close(); }
  }
  if (!need) throw new Error('Describe what you need, for example: "a feature flag service for Go".');
  const result = await recommend(need, opts);
  if (!result.ranked.length) { io.log(`No repositories found for: ${result.query}`); return 0; }
  io.log(`Recommendations for: ${need}\n`);
  io.log(result.ranked.map(formatResult).join('\n\n'));
  io.log(`\nGitHub matched ${result.total.toLocaleString()} repositories. Showing ${result.ranked.length}.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll('\\', '/')}`) main().catch(error => { console.error(error.message); process.exitCode = 1; });

