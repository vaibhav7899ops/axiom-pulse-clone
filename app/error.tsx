"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sub mb-4">{error.message}</p>
      <button className="btn" onClick={reset}>Try again</button>
    </div>
  );
}
