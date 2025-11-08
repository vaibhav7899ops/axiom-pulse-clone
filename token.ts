export type TokenRow = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  volume24h: number;
  liquidity: number;
  mcap: number;
  ageMins: number;
  segment: "new" | "final" | "migrated";
};
