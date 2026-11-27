const apiCache = new Map();
const inFlight = new Map();

/**
 * SWR-style in-memory JSON fetch cache with in-flight request deduplication.
 * Avoids `?_t=` cache-busting so HTTP/CDN Cache-Control works effectively.
 */
export async function cachedFetchJson(url, options = {}) {
  const { ttlMs = 60000, bustCache = false, headers = {}, onRevalidate } = options;
  const now = Date.now();
  const cached = !bustCache ? apiCache.get(url) : null;

  const fetchFresh = async () => {
    if (inFlight.has(url)) {
      return inFlight.get(url);
    }
    const reqPromise = (async () => {
      try {
        const res = await fetch(url, { headers });
        const json = await res.json();
        if (res.ok && json && json.success !== false) {
          apiCache.set(url, { data: json, timestamp: Date.now() });
        }
        return json;
      } finally {
        inFlight.delete(url);
      }
    })();
    inFlight.set(url, reqPromise);
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
