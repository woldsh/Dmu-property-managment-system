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

        console.log('🌍 Fetching geolocation from multiple sources...');

        // SOURCE 1: ipapi.co
        let isEthiopia = false;
        try {
            const response = await fetch('https://ipapi.co/json/', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const data = await response.json();
                isEthiopia = data.country_code === 'ET';
                if (isEthiopia) {
                    console.log('🌍 Detected ET via ipapi.co');
                }
            }
        } catch (e) {
            console.warn('⚠️ ipapi.co failed');
        }

        // SOURCE 2: ip-api.com (Fallback)
        if (!isEthiopia) {
            try {
                const response = await fetch('http://ip-api.com/json/');
                if (response.ok) {
                    const data = await response.json();
                    isEthiopia = data.countryCode === 'ET';
                    if (isEthiopia) {
                        console.log('🌍 Detected ET via ip-api.com');
                    }
                }
            } catch (e) {
                console.warn('⚠️ ip-api.com failed');
            }
        }

        // Cache the result
        cachedGeoLocation = {
            isEthiopia,
            timestamp: Date.now(),
        };

        return isEthiopia;
    } catch (error) {
        console.error('❌ Geolocation check failed:', error);
        return true; // Fail-open
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
