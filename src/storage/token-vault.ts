const TOKEN_KEY = 'englist_ai_token';

// Token is stored in sessionStorage (per-tab, cleared on close)
// For device-encrypted mode, use IndexedDB + Web Crypto (future)
let memoryToken: string | null = null;

export async function storeToken(token: string, mode: 'memory' | 'session' = 'session'): Promise<void> {
  memoryToken = token;
  if (mode === 'session') {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
  }
}

export async function getStoredToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  try {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) memoryToken = t;
  } catch {}
  return memoryToken;
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

export function hasToken(): boolean {
  return memoryToken !== null || (() => {
    try { return !!sessionStorage.getItem(TOKEN_KEY); } catch { return false; }
  })();
}
