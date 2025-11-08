import { NextResponse } from "next/server";

const symbols = [
  ["SOL", "Solana"], ["ETH", "Ethereum"], ["BTC", "Bitcoin"], ["AXIOM", "Axiom"],
  ["VCRV", "Virtual Curve"], ["PUMP", "Pump"], ["LAB", "LaunchLab"], ["BONK","Bonk"]
];

function makeOne(i:number) {
  const [sym, name] = symbols[i % symbols.length];
  const price = +(Math.random()*100 + 1).toFixed(2);
  const change1h = +(Math.random()*10 - 5).toFixed(2);
  const volume24h = Math.floor(Math.random()*5_000_000);
  const liquidity = Math.floor(Math.random()*2_000_000);
  const mcap = Math.floor(Math.random()*200_000_000);
  const ageMins = Math.floor(Math.random()*5000);
  const segments = ["new","final","migrated"] as const;
  const segment = segments[i % 3];
  return { id:`${sym}-${i}`, symbol:sym, name, price, change1h, volume24h, liquidity, mcap, ageMins, segment };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const start = (page-1)*pageSize;
  const rows = Array.from({length: pageSize}).map((_,i)=>makeOne(start+i));
  return NextResponse.json({ rows, nextPage: page < 5 ? page + 1 : null });
}
