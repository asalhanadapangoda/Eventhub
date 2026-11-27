const apiCache = new Map();
const inFlight = new Map();

/**
 * Resolves relative `/api/...` paths against an optional custom API domain
 * (`VITE_API_BASE_URL`, e.g. `https://api.traceprojects.org.lk`) so production
 * deployments are not coupled strictly to a hardcoded `vercel.json` proxy target.
 */
export function resolveApiUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const customBase = (import.meta.env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (customBase && url.startsWith('/api/')) {
    return `${customBase}${url}`;
  }
  return url;
}

/**
 * SWR-style in-memory JSON fetch cache with in-flight request deduplication.
 * Avoids `?_t=` cache-busting so HTTP/CDN Cache-Control works effectively.
 */
export async function cachedFetchJson(url, options = {}) {
  const { ttlMs = 60000, bustCache = false, headers = {}, onRevalidate } = options;
  const resolvedUrl = resolveApiUrl(url);
  const now = Date.now();
  const cached = !bustCache ? apiCache.get(resolvedUrl) : null;

  const fetchFresh = async () => {
    if (inFlight.has(resolvedUrl)) {
      return inFlight.get(resolvedUrl);
    }
    const reqPromise = (async () => {
      try {
        const res = await fetch(resolvedUrl, { headers });
        const json = await res.json();
        if (res.ok && json && json.success !== false) {
          apiCache.set(resolvedUrl, { data: json, timestamp: Date.now() });
        }
        return json;
      } finally {
        inFlight.delete(resolvedUrl);
      }
    })();
    inFlight.set(resolvedUrl, reqPromise);
    return reqPromise;
  };

  if (cached) {
    const isFresh = now - cached.timestamp < ttlMs;
    if (isFresh) {
      return cached.data;
    }
    if (typeof onRevalidate === 'function') {
      fetchFresh()
        .then((fresh) => {
          if (fresh) onRevalidate(fresh);
        })
        .catch(() => {});
      return cached.data;
    }
  }

  return fetchFresh();
}

/**
 * Invalidates cached API responses matching a URL prefix.
 */
export function invalidateApiCache(prefix = '') {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
}
