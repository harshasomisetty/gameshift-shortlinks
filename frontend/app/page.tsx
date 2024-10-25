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
    setLinks([newLink, ...links]);
    setLongUrl('');
  };

  const deleteLink = async (shortCode: string) => {
    await fetch('/api/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortCode }),
    });
    setLinks(links.filter((link) => link.shortCode !== shortCode));
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Shortlink Generator
      </h1>
      <form onSubmit={createLink} className="mb-12">
        <div className="flex">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter long URL"
            required
            className="flex-grow border border-gray-300 rounded-l p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition duration-200"
          >
            Create Shortlink
          </button>
        </div>
      </form>
      <ul className="space-y-4">
        {links.map((link) => (
          <li
            key={link.shortCode}
            className="bg-gray-100 p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <a
                href={`/${link.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`}
              </a>
              <p className="text-sm text-gray-600 mt-1">{link.longUrl}</p>
            </div>
            <button
              onClick={() => deleteLink(link.shortCode)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
