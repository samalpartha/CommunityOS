import * as functions from 'firebase-functions';

// Google Places API configuration
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';
const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Proxy for Google Places Nearby Search to avoid CORS
 */
export const proxyGooglePlaces = functions.https.onCall(async (data, context) => {
    // Optional: Check auth
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    // }

    const { location, radius, type, keyword } = data;
    const apiKey = functions.config().google?.places_api_key;

    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'API Key not configured.');
    }

    try {
        let url = `${PLACES_API_URL}/nearbysearch/json?` +
            `location=${location.lat},${location.lng}` +
            `&radius=${radius || 5000}` +
            `&key=${apiKey}`;

        if (type) {
            url += `&type=${type}`;
        }

        // Note: 'keyword' parameter in Google Places API is 'keyword', not 'name'
        // If we want to filter by name/pantry etc on the server side google query
        // But the previous implementation filtered in memory.
        // We will just do a simple nearby search here.

        const response = await fetch(url);
        if (!response.ok) {
            throw new functions.https.HttpsError('internal', `Upstream API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result; // Returns the raw Google Places response

    } catch (error) {
        console.error('Proxy Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch places.');
    }
});

/**
 * Proxy for Google Geocoding to avoid CORS
 */
export const proxyGeocode = functions.https.onCall(async (data, context) => {
    const { address } = data;
    const apiKey = functions.config().google?.places_api_key;

    if (!apiKey) {
        throw new functions.https.HttpsError('failed-precondition', 'API Key not configured.');
    }

    try {
        const url = `${GEOCODE_API_URL}?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new functions.https.HttpsError('internal', `Upstream API error: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Proxy Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to geocode.');
    }
});
