import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export async function POST(request: Request) {
  const body = (await request.json()) as { accessToken?: string };

  if (!body.accessToken) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Access token is required.',
        },
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    data: { success: true },
    meta: null,
    error: null,
  });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: body.accessToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: '/',
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    data: { success: true },
    meta: null,
    error: null,
  });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });

  return response;
}
