'use client';

import { useEffect, useState } from 'react';

type ShortLink = {
  shortCode: string;
  longUrl: string;
  createdAt: string;
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [longUrl, setLongUrl] = useState('');
  const [customShortCode, setCustomShortCode] = useState('');
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [editLongUrl, setEditLongUrl] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  };

  useEffect(() => {
    const authStatus = sessionStorage?.getItem('isLinkAdminAuthenticated');
    setIsAuthenticated(authStatus === 'true');

    if (authStatus === 'true') {
      fetchLinks();
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <div className="flex justify-center items-center">Loading...</div>
      </main>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage?.setItem('isLinkAdminAuthenticated', 'true');
        await fetchLinks();
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="max-w-md mx-auto">
          <div className="flex flex-col space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </main>
    );
  }

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl, customShortCode }),
    });
    if (res.ok) {
      const newLink = await res.json();
      setLinks([newLink, ...links]);
      setLongUrl('');
      setCustomShortCode('');
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const deleteLink = async (shortCode: string) => {
    await fetch('/api/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortCode }),
    });
    setLinks(links.filter((link) => link.shortCode !== shortCode));
  };

  const startEditing = (link: ShortLink) => {
    setEditingLink(link);
    setEditLongUrl(link.longUrl);
  };

  const cancelEditing = () => {
    setEditingLink(null);
    setEditLongUrl('');
  };

  const updateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shortCode: editingLink.shortCode,
        longUrl: editLongUrl,
      }),
    });

    if (res.ok) {
      const updatedLink = await res.json();
      setLinks(
        links.map((link) =>
          link.shortCode === updatedLink.shortCode
            ? { ...link, longUrl: updatedLink.longUrl }
            : link,
        ),
      );
      cancelEditing();
    } else {
      console.error('Failed to update link');
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Shortlink Generator
      </h1>
      <form onSubmit={createLink} className="mb-12">
        <div className="flex flex-col space-y-2">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter long URL"
            required
            className="border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={customShortCode}
            onChange={(e) => setCustomShortCode(e.target.value)}
            placeholder="Enter custom short code (optional)"
            className="border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Create Shortlink
          </button>
        </div>
      </form>
      <ul className="space-y-4">
        {links.map((link) => (
          <li
            key={link.shortCode}
            className="bg-gray-100 p-4 rounded shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            {editingLink?.shortCode === link.shortCode ? (
              <form onSubmit={updateLink} className="w-full">
                <input
                  type="url"
                  value={editLongUrl}
                  onChange={(e) => setEditLongUrl(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
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
                <div className="mt-2 sm:mt-0 space-x-2">
                  <button
                    onClick={() => startEditing(link)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLink(link.shortCode)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
