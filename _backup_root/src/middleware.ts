import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login'];

    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/api'));

    // If it's a public route, allow access
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // For protected routes, check if user has authentication cookie/token
    // Note: Firebase auth uses indexedDB, not cookies, so we'll rely on client-side protection
    // This middleware primarily blocks direct URL access attempts

    // Protected routes
    const protectedRoutes = ['/dashboard', '/portal', '/service', '/workspace', '/admin-panel', '/admin'];

    // Check if accessing a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        // Allow the request to proceed - client-side ProtectedRoute component will handle auth check
        return NextResponse.next();
    }

    // Block access to old internal routes (academic-staff, managing-director, etc.)
    const blockedRoutes = [
        '/academic-staff',
        '/managing-director',
        '/general-service',
        '/chief',
        '/procurement-management',
        '/admin-staff'
    ];

    const isBlockedRoute = blockedRoutes.some(route => pathname.startsWith(route));

    if (isBlockedRoute) {
        // Redirect to login for blocked routes
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
