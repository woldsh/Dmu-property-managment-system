import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ========================================
    // STEP 1: Geolocation Check (Ethiopia Only)
    // ========================================

    // Allow API routes and static files to bypass geo-check
    const bypassGeoCheck = pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('favicon.ico') ||
        pathname === '/geo-blocked';

    if (!bypassGeoCheck) {
        // Check if we have a cached geolocation result
        const geoCache = request.cookies.get('geo_allowed');

        if (!geoCache || geoCache.value !== 'true') {
            // Perform geolocation check
            try {
                const response = await fetch('https://ipapi.co/json/', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json();
                    const isEthiopia = data.country_code === 'ET';

                    if (!isEthiopia) {
                        // Block access - redirect to geo-blocked page
                        const geoBlockedUrl = new URL('/geo-blocked', request.url);
                        return NextResponse.redirect(geoBlockedUrl);
                    } else {
                        // User is in Ethiopia - set cache cookie and allow access
                        const response = NextResponse.next();
                        response.cookies.set('geo_allowed', 'true', {
                            maxAge: 60 * 60 * 24, // 24 hours
                            httpOnly: true,
                            sameSite: 'strict',
                        });
                        return response;
                    }
                } else {
                    // API failed - allow access by default (fail-open mode)
                    console.warn('⚠️ Geolocation API failed, allowing access (fail-open mode)');
                    const response = NextResponse.next();
                    response.cookies.set('geo_allowed', 'true', {
                        maxAge: 60 * 60, // 1 hour (shorter cache for API failures)
                        httpOnly: true,
                        sameSite: 'strict',
                    });
                    return response;
                }
            } catch (error) {
                // Network error - allow access by default
                console.error('❌ Geolocation check error:', error);
                const response = NextResponse.next();
                response.cookies.set('geo_allowed', 'true', {
                    maxAge: 60 * 60, // 1 hour
                    httpOnly: true,
                    sameSite: 'strict',
                });
                return response;
            }
        }
    }

    // ========================================
    // STEP 2: Route Protection (existing logic)
    // ========================================

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
    const protectedRoutes = ['/dashboard', '/portal', '/service', '/workspace', '/admin-panel', '/admin', '/procurement-management'];

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
