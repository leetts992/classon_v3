import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Extract subdomain
  const parts = hostname.split('.')

  // If it's the main domain (class-on.kr or www.class-on.kr)
  if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
    // Allow main domain to pass through
    return NextResponse.next()
  }

  // If it's api subdomain, skip
  if (parts[0] === 'api') {
    return NextResponse.next()
  }

  // Extract subdomain (e.g., "demo" from "demo.class-on.kr")
  const subdomain = parts[0]

  // Rewrite to the subdomain route
  // e.g., demo.class-on.kr/ -> class-on.kr/demo/
  // e.g., demo.class-on.kr/courses -> class-on.kr/demo/courses

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
