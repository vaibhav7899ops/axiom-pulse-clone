'use client';
export default function Error({ error }: { error: Error }) {
  return <div className="p-4 rounded-md border border-red-300 bg-red-50 text-red-700">
    Something went wrong: {error.message}
  </div>;
}
