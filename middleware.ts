import { NextRequest, NextResponse } from 'next/server'

// Routes that are always public
const PUBLIC_ROUTES = ['/', '/sign-in', '/sign-up']
const PUBLIC_PREFIXES = ['/user', '/manual', '/api/auth', '/_next', '/favicon']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next()
  }

  // Protect /manufacturer/* (except /manufacturer/login)
  if (
    pathname.startsWith('/manufacturer') &&
    !pathname.startsWith('/manufacturer/login')
  ) {
    // Check for Better Auth session cookie
    const sessionCookie = request.cookies.get('better-auth.session_token')
    if (!sessionCookie) {
      const loginUrl = new URL('/manufacturer/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
