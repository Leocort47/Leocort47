import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUERY = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'query.graphql'), 'utf8');

async function query(login, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'leocort47-profile' },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data.user;
}

/** Each repo weighs the same, so one large repo cannot hide the rest of the stack. */
function languageShares(repos, { excludeRepos = [], excludeLanguages = [], topLanguages = 6, activeMonths = 24 }) {
  const totals = new Map();
  const cutoff = Date.now() - activeMonths * 30.44 * 24 * 3600 * 1000;
  for (const repo of repos) {
    if (excludeRepos.includes(repo.name)) continue;
    if (new Date(repo.pushedAt).getTime() < cutoff) continue;
    const edges = repo.languages.edges.filter((e) => !excludeLanguages.includes(e.node.name));
    const sum = edges.reduce((acc, e) => acc + e.size, 0);
    if (!sum) continue;
    for (const e of edges) {
      const prev = totals.get(e.node.name) || { name: e.node.name, color: e.node.color || '#8b949e', weight: 0 };
      prev.weight += e.size / sum;
      totals.set(e.node.name, prev);
    }
  }
  const all = [...totals.values()].sort((a, b) => b.weight - a.weight);
  const grand = all.reduce((acc, l) => acc + l.weight, 0) || 1;
  const top = all
    .slice(0, topLanguages)
    .map((l) => ({ name: l.name, color: l.color, share: l.weight / grand }))
    .filter((l) => l.share >= 0.01);
  const rest = 1 - top.reduce((acc, l) => acc + l.share, 0);
  if (rest > 0.005) top.push({ name: 'Other', color: '#6b7f9c', share: rest });
  return top;
}

function summarize(user, metricsCfg) {
  const cc = user.contributionsCollection;
  return {
    contributions: cc.contributionCalendar.totalContributions,
    commits: cc.totalCommitContributions,
    repositories: user.repositories.totalCount,
    stars: user.repositories.nodes.reduce((acc, r) => acc + r.stargazerCount, 0),
    languages: languageShares(user.repositories.nodes, metricsCfg),
    weeks: cc.contributionCalendar.weeks.map((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
  };
}

/**
 * fullScope: the token can read private repositories (PROFILE_TOKEN or a local gh token).
 * Without it, repository-level figures are kept from the cache so private work does not vanish.
 */
export async function loadGitHubData({ login, token, fullScope, cachePath, metrics, rawPath }) {
  const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : null;
  if (rawPath) {
    // Local runs: `gh api graphql -F login=… -f query=@scripts/query.graphql > raw.json`
    const data = summarize(JSON.parse(readFileSync(rawPath, 'utf8')).data.user, metrics);
    mkdirSync(dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, `${JSON.stringify(data, null, 2)}\n`);
    return data;
  }
  if (!token) {
    console.warn('No GitHub token: using cached data.');
    return cache || emptyData();
  }
  let fresh;
  try {
    fresh = summarize(await query(login, token), metrics);
  } catch (err) {
    console.warn(`GitHub API unavailable (${err.message}): using cached data.`);
    return cache || emptyData();
  }
  const data = fullScope || !cache ? fresh : mergeWithCache(fresh, cache);
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

/**
 * A public-only token cannot see private contributions, so each day keeps the
 * higher of the cached and fresh counts instead of dropping private work.
 */
function mergeWithCache(fresh, cache) {
  const cached = new Map(cache.weeks.flat().map((d) => [d.date, d.count]));
  const weeks = fresh.weeks.map((w) => w.map((d) => ({ date: d.date, count: Math.max(d.count, cached.get(d.date) || 0) })));
  const contributions = weeks.flat().reduce((acc, d) => acc + d.count, 0);
  return {
    ...fresh,
    weeks,
    contributions: Math.max(contributions, fresh.contributions),
    commits: Math.max(cache.commits, fresh.commits),
    repositories: cache.repositories,
    stars: Math.max(cache.stars, fresh.stars),
    languages: cache.languages,
  };
}

function emptyData() {
  return { contributions: 0, commits: 0, repositories: 0, stars: 0, languages: [], weeks: [] };
}
