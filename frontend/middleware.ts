import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Extract subdomain
  const parts = hostname.split('.')

  // If it's the main domain (class-on.kr or www.class-on.kr)
  if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
    // Only allow root path and specific routes on main domain
    const allowedPaths = ['/', '/login', '/signup', '/dashboard']
    const isAllowedPath = allowedPaths.some(path =>
      url.pathname === path || url.pathname.startsWith(path + '/')
    )

    if (isAllowedPath) {
      return NextResponse.next()
    }

    // Allow Next.js internal requests (RSC, prefetch, etc.)
    if (url.searchParams.has('_rsc') ||
        url.searchParams.has('_next') ||
        url.pathname.startsWith('/_next')) {
      return NextResponse.next()
    }

    // Block access to dynamic subdomain routes on main domain (e.g., /admin, /demo)
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  // If it's api subdomain, skip
  if (parts[0] === 'api') {
    return NextResponse.next()
  }

  // Extract subdomain (e.g., "admin" from "admin.class-on.kr")
  const subdomain = parts[0]

  // If it's dashboard route, don't rewrite - just pass through
  if (url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/signup') ||
      url.pathname.startsWith('/my-orders')) {
    return NextResponse.next()
  }

  // Allow Next.js internal requests (RSC, prefetch, etc.) on subdomains
  if (url.searchParams.has('_rsc') || url.searchParams.has('_next')) {
    // For RSC requests on subdomains, don't rewrite
    return NextResponse.next()
  }

  // Rewrite to the subdomain route
  // e.g., admin.class-on.kr/ -> class-on.kr/admin/
  // e.g., admin.class-on.kr/courses -> class-on.kr/admin/courses
  url.pathname = `/${subdomain}${url.pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
