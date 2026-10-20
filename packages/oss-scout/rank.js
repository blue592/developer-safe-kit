const DAY = 86_400_000;

function freshness(date) {
  const age = Math.max(0, (Date.now() - Date.parse(date)) / DAY);
  return Math.max(0, 1 - age / 730);
}

export function score(repo, preferences = {}) {
  const stars = Math.log10(Math.max(1, repo.stargazers_count || 0)) / 6;
  const issues = 1 - Math.min(1, (repo.open_issues_count || 0) / 1000);
  const docs = repo.has_wiki || repo.description ? 1 : 0;
  const recency = freshness(repo.pushed_at || repo.updated_at || new Date(0).toISOString());
  let value = stars * 0.35 + recency * 0.30 + docs * 0.20 + issues * 0.15;
  if (preferences.language && repo.language?.toLowerCase() === preferences.language.toLowerCase()) value += 0.12;
  if (preferences.license && repo.license?.spdx_id?.toLowerCase() === preferences.license.toLowerCase()) value += 0.10;
  return Math.round(value * 1000) / 10;
}

export function rank(items, preferences = {}) {
  return items.map(repo => ({ repo, score: score(repo, preferences) })).sort((a, b) => b.score - a.score);
}

export function formatResult({ repo, score: value }, index) {
  const license = repo.license?.spdx_id || 'license not detected';
  const desc = (repo.description || 'No description provided.').replace(/\s+/g, ' ').trim();
  return `${index + 1}. ${repo.full_name} — ${value}/100\n   ${desc}\n   ★ ${(repo.stargazers_count || 0).toLocaleString()}  •  ${repo.language || 'language unknown'}  •  ${license}\n   ${repo.html_url}`;
}

