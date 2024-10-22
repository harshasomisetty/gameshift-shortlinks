import { NextRequest, NextResponse } from 'next/server';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  const j = await response.json();
  console.log(j);
  return j;
}

export async function POST(request: NextRequest) {
  const { longUrl } = await request.json();
  const result = await fetchFromAPI('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ longUrl }),
  });
  return NextResponse.json(result);
}

export async function GET() {
  const links = await fetchFromAPI('/api/links');
  return NextResponse.json(links);
}

export async function PUT(request: NextRequest) {
  const { shortCode, longUrl } = await request.json();
  const result = await fetchFromAPI('/api/links', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shortCode, longUrl }),
  });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { shortCode } = await request.json();
  const result = await fetchFromAPI('/api/links', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shortCode }),
  });
  return NextResponse.json(result);
}
