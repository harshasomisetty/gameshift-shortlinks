import { NextRequest, NextResponse } from 'next/server';

async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(
    `${process.env.API_BASE_URL}${endpoint}`,
    options,
  );
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  const j = await response.json();
  console.log(j);
  return j;
}

export async function POST(request: NextRequest) {
  try {
    const { longUrl, customShortCode } = await request.json();
    const result = await fetchFromAPI('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl, customShortCode }),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
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
