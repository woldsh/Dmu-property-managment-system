/**
 * Geolocation Utility
 * Detects user's country based on IP address and validates if they're in Ethiopia
 */

interface GeoLocationResponse {
    country_code: string;
    country_name: string;
    city?: string;
    ip: string;
}

// Cache the geolocation result to avoid repeated API calls
let cachedGeoLocation: { isEthiopia: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if the user is accessing from Ethiopia
 * @returns Promise<boolean> - true if user is in Ethiopia, false otherwise
 */
export async function isUserInEthiopia(): Promise<boolean> {
    try {
        // Check cache first
        if (cachedGeoLocation && Date.now() - cachedGeoLocation.timestamp < CACHE_DURATION) {
            console.log('🌍 Using cached geolocation result:', cachedGeoLocation.isEthiopia);
            return cachedGeoLocation.isEthiopia;
        }

        console.log('🌍 Fetching geolocation from API...');

        // Fetch geolocation from ipapi.co (free tier: 1,000 requests/day)
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Geolocation API responded with status: ${response.status}`);
        }

        const data: GeoLocationResponse = await response.json();
        console.log('🌍 Geolocation API response:', {
            country: data.country_name,
            code: data.country_code,
            city: data.city,
        });

        // Check if country code is Ethiopia (ET)
        const isEthiopia = data.country_code === 'ET';

        // Cache the result
        cachedGeoLocation = {
            isEthiopia,
            timestamp: Date.now(),
        };

        return isEthiopia;
    } catch (error) {
        console.error('❌ Geolocation check failed:', error);

        // IMPORTANT: On API failure, allow access by default
        // This prevents legitimate users from being locked out if the API is down
        // Change this to 'return false' if you want to block access on API failures
        console.warn('⚠️ Allowing access due to geolocation API failure (fail-open mode)');
        return true;
    }
}

/**
 * Clear the cached geolocation result
 * Useful for testing or when you want to force a fresh check
 */
export function clearGeoLocationCache(): void {
    cachedGeoLocation = null;
    console.log('🌍 Geolocation cache cleared');
}

/**
 * Get the cached geolocation status without making an API call
 * @returns boolean | null - true/false if cached, null if no cache exists
 */
export function getCachedGeoLocationStatus(): boolean | null {
    if (cachedGeoLocation && Date.now() - cachedGeoLocation.timestamp < CACHE_DURATION) {
        return cachedGeoLocation.isEthiopia;
    }
    return null;
}
