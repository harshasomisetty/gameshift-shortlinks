'use client';

import { useEffect, useState } from 'react';

type ShortLink = {
  shortCode: string;
  longUrl: string;
  createdAt: string;
};

export default function Home() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [longUrl, setLongUrl] = useState('https://www.point.me');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const res = await fetch('/api/links');
    const data = await res.json();
    setLinks(data);
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl }),
    });
    const newLink = await res.json();
    setLinks([...links, newLink]);
    setLongUrl('');
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shortlink Generator</h1>
      <form onSubmit={createLink} className="mb-8">
        <input
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="Enter long URL"
          required
          className="border p-2 mr-2 text-black"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Shortlink
        </button>
      </form>
      <ul>
        {links.map((link) => (
          <li key={link.shortCode} className="mb-2">
            <a
              href={`/${link.shortCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
            </a>
            {' -> '}
            {link.longUrl}
          </li>
        ))}
      </ul>
    </main>
  );
}
