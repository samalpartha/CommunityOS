import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize if not already initialized (existing code has this)
// admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled Cloud Function to sync resource data from Google Places API daily
 * Runs every day at 2 AM UTC
 */
export const syncResourcesDaily = functions.pubsub
    .schedule('0 2 * * *') // Cron: 2 AM daily
    .timeZone('America/New_York')
    .onRun(async (context) => {
        console.log('Starting daily resource sync...');

        try {
            // Define cities/regions to sync
            const cities = [
                { id: 'default', name: 'Default Location', lat: 40.7128, lng: -74.0060 }, // NYC
                { id: 'sf', name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
                { id: 'la', name: 'Los Angeles', lat: 34.0522, lng: -118.2437 }
            ];

            const PLACES_API_KEY = functions.config().google?.places_api_key;

            if (!PLACES_API_KEY) {
                console.error('Google Places API key not configured');
                return null;
            }

            let totalSynced = 0;

            for (const city of cities) {
                console.log(`Syncing resources for ${city.name}...`);

                // Fetch each resource type
                const resourceTypes = [
                    { type: 'FOOD_BANK', placeType: 'food', keywords: ['food', 'bank', 'pantry', 'kitchen'] },
                    { type: 'HOSPITAL', placeType: 'hospital', keywords: [] },
                    { type: 'SHELTER', placeType: 'lodging', keywords: ['shelter', 'homeless'] },
                    { type: 'PHARMACY', placeType: 'pharmacy', keywords: [] }
                ];

                for (const resType of resourceTypes) {
                    const places = await fetchPlacesFromAPI(
                        city.lat,
                        city.lng,
                        resType.placeType,
                        resType.keywords,
                        PLACES_API_KEY
                    );

                    // Save to Firestore
                    for (const place of places) {
                        const resource = convertToResource(place, resType.type, city.id);
                        await db.collection('cached_resources').doc(resource.id).set(resource);
                        totalSynced++;
                    }
                }

                // Update metadata
                await db.collection('cache_metadata').doc(city.id).set({
                    lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
                    cityName: city.name,
                    syncedCount: totalSynced
                });
            }

            console.log(`Successfully synced ${totalSynced} resources`);
            return { success: true, count: totalSynced };

        } catch (error) {
            console.error('Error syncing resources:', error);
            throw error;
        }
    });

/**
 * Helper function to fetch places from Google Places API
 */
async function fetchPlacesFromAPI(
    lat: number,
    lng: number,
    placeType: string,
    keywords: string[],
    apiKey: string
): Promise<any[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}` +
        `&radius=5000` +
        `&type=${placeType}` +
        `&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Places API error:', data.status, data.error_message);
        return [];
    }

    let results = data.results || [];

    // Filter by keywords if provided (for FOOD_BANK)
    if (keywords.length > 0) {
        results = results.filter((place: any) => {
            const nameLower = place.name.toLowerCase();
            return keywords.some(keyword => nameLower.includes(keyword));
        });
    }

    return results;
}

/**
 * Convert Google Places result to CommunityResource format
 */
function convertToResource(place: any, resourceType: string, cityId: string): any {
    const descriptions: Record<string, string> = {
        'FOOD_BANK': 'Free food assistance and groceries',
        'HOSPITAL': 'Emergency and medical services',
        'SHELTER': 'Temporary housing and support',
        'PHARMACY': 'Medications and healthcare products'
    };

    const services: Record<string, string[]> = {
        'FOOD_BANK': ['Food distribution', 'Grocery assistance', 'Meal programs'],
        'HOSPITAL': ['Emergency care', 'Medical treatment', 'Urgent care'],
        'SHELTER': ['Emergency housing', 'Support services', 'Referrals'],
        'PHARMACY': ['Prescriptions', 'Over-the-counter', 'Consultations']
    };

    return {
        id: place.place_id,
        name: place.name,
        type: resourceType,
        description: descriptions[resourceType] || place.vicinity,
        location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            address: place.vicinity
        },
        contact: {
            phone: place.formatted_phone_number || 'Call for info',
            hours: place.opening_hours?.open_now ? 'Open now' : 'Check hours'
        },
        services: services[resourceType] || [],
        verified: true,
        cityId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };
}
