// lib/api.ts
export type TokenRow = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  volume24h: number;
  segment: 'new' | 'final' | 'migrated';
};

export type TokenPage = {
  page: number;
  pageSize: number;
  total: number;
  rows: TokenRow[];
};

// Primary helper — works with both named and default imports
export async function getTokens(params: {
  page?: number;
  pageSize?: number;
  segment?: string;
  search?: string;
  sort?: string;
} = {}): Promise<TokenPage> {
  const { page = 1, pageSize = 20 } = params;
  const url = `/api/tokens?page=${page}&pageSize=${pageSize}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch tokens: ${res.status}`);
  return res.json();
}

// Compatibility aliases (in case your code imported different names)
export async function fetchTokens(p?: Parameters<typeof getTokens>[0]) {
  return getTokens(p);
}
export async function fetchTokenPage(page = 1, pageSize = 20) {
  return getTokens({ page, pageSize });
}

const api = { getTokens, fetchTokens, fetchTokenPage };
export default api;
