import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error_description || error)}`, request.url)
    );
  }

  if (code) {
    // Supabase handles the code exchange client-side via the onAuthStateChange listener
    // Redirect back to app root so the client-side auth code picks up the session
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}
