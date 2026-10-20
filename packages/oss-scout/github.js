const API = 'https://api.github.com';

export function queryFromNeed(need) {
  const cleaned = need.trim().replace(/[^\p{L}\p{N}\s+.#-]/gu, ' ').replace(/\s+/g, ' ');
  if (!cleaned || cleaned.length > 300) throw new Error('Describe a need between 1 and 300 characters.');
  return `${cleaned.trim()} in:name,description,readme`;
}

export async function searchRepositories(need, { token, fetcher = fetch, limit = 10 } = {}) {
  const query = queryFromNeed(need);
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'oss-scout/0.1.0' };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetcher(`${API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${Math.min(Math.max(limit, 1), 30)}`, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`GitHub search failed (${response.status}). Check your network or GITHUB_TOKEN.`);
  const body = await response.json();
  return { total: body.total_count ?? 0, items: body.items ?? [], query };
}

