'use client';
import { useState } from 'react';

type Props = {
  segment: 'new'|'final'|'migrated';
  onSegment(v: Props['segment']): void;
  search: string;
  onSearch(v: string): void;
};

export default function HeaderBar({ segment, onSegment, search, onSearch }: Props) {
  const tabs: Props['segment'][] = ['new','final','migrated'];
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => onSegment(t)}
            className={`rounded-full px-3 py-1 text-sm border ${segment===t?'bg-black text-white':'hover:bg-gray-100'}`}
          >
            {t === 'new' ? 'New Pairs' : t === 'final' ? 'Final Stretch' : 'Migrated'}
          </button>
        ))}
      </div>
      <input
        value={search}
        onChange={e=>onSearch(e.target.value)}
        placeholder="Search token…"
        className="w-full md:w-72 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
    </div>
  );
}
