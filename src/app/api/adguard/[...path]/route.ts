import { NextRequest } from 'next/server';

const ADGUARD_URL = process.env.ADGUARD_URL || 'null';
const ADGUARD_USERNAME = process.env.ADGUARD_USERNAME || 'null';
const ADGUARD_PASSWORD = process.env.ADGUARD_PASSWORD || 'null';

const auth = Buffer.from(`${ADGUARD_USERNAME}:${ADGUARD_PASSWORD}`).toString('base64');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const response = await fetch(`${ADGUARD_URL}/control/${path}${queryString}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('AdGuard API error:', error);
    return Response.json({ error: 'Failed to fetch from AdGuard' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await context.params;
    const path = pathArray.join('/');
    const body = await request.json();

    const response = await fetch(`${ADGUARD_URL}/control/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('AdGuard API error:', error);
    return Response.json({ error: 'Failed to post to AdGuard' }, { status: 500 });
  }
}