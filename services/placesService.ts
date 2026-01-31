import { collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { db } from '../firebaseConfig';
// import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const MOCK_PLACES = [
    {
        place_id: 'mock_1',
        name: 'Community Hope Food Bank',
        vicinity: '123 Main St, Springfield',
        geometry: { location: { lat: 37.7749, lng: -122.4194 } },
        rating: 4.8,
        user_ratings_total: 124,
        opening_hours: { open_now: true },
        photos: [{ photo_reference: 'mock_photo_1' }],
        types: ['food_bank', 'point_of_interest'],
        mock_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800'
    },
    {
        place_id: 'mock_2',
        name: 'City General Hospital',
        vicinity: '456 Medical Center Dr, Springfield',
        geometry: { location: { lat: 37.7849, lng: -122.4094 } },
        rating: 4.5,
        user_ratings_total: 856,
        opening_hours: { open_now: true },
        photos: [{ photo_reference: 'mock_photo_2' }],
        types: ['hospital', 'health'],
        mock_image: 'https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?auto=format&fit=crop&q=80&w=800'
    },
    {
        place_id: 'mock_3',
        name: 'Safe Haven Shelter',
        vicinity: '789 Shelter Ave, Springfield',
        geometry: { location: { lat: 37.7649, lng: -122.4294 } },
        rating: 4.9,
        user_ratings_total: 42,
        opening_hours: { open_now: false },
        photos: [{ photo_reference: 'mock_photo_3' }],
        types: ['lodging', 'point_of_interest'],
        mock_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'
    },
    {
        place_id: 'mock_4',
        name: 'Downtown Pharmacy',
        vicinity: '101 Market St, Springfield',
        geometry: { location: { lat: 37.7549, lng: -122.4394 } },
        rating: 4.2,
        user_ratings_total: 15,
        opening_hours: { open_now: true },
        photos: [{ photo_reference: 'mock_photo_4' }],
        types: ['pharmacy', 'health'],
        mock_image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800'
    }
];

export interface PlaceResult {
    place_id: string;
    name: string;
    vicinity: string; // address
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: {
        open_now: boolean;
    };
    photos?: {
        photo_reference: string;
    }[];
    types?: string[];
    // Helper for UI
    mock_image?: string;
}

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const getCachedResources = async (
    location: { lat: number; lng: number },
    radiusKm: number = 10
): Promise<PlaceResult[]> => {
    try {
        // In a real app with GeoFire or similar, we'd query by distance.
        // For this hackathon, we'll fetch all and filter client-side or filtered by cityId if we had it.
        // Simplified: Fetch all cached resources (assuming valid dataset size < 1000)
        const q = query(collection(db, 'cached_resources'));
        const querySnapshot = await getDocs(q);

        const resources: PlaceResult[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Calculate distance roughly
            const dist = getDistanceFromLatLonInKm(location.lat, location.lng, data.location.lat, data.location.lng);

            if (dist <= radiusKm) {
                resources.push({
                    place_id: data.id,
                    name: data.name,
                    vicinity: data.location.address,
                    geometry: {
                        location: data.location
                    },
                    rating: 4.5, // Default for curated
                    user_ratings_total: 10,
                    types: [data.type.toLowerCase()],
                    mock_image: getMockImageForType(data.type)
                });
            }
        });

        return resources.length > 0 ? resources : MOCK_PLACES;
    } catch (e) {
        console.error("Failed to fetch cached resources", e);
        return MOCK_PLACES;
    }
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

function getMockImageForType(type: string) {
    switch (type) {
        case 'FOOD_BANK': return 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800';
        case 'HOSPITAL': return 'https://images.unsplash.com/photo-1587351021759-3e566b9af9ef?auto=format&fit=crop&q=80&w=800';
        case 'SHELTER': return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800';
        default: return 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800';
    }
}

export const searchNearbyPlaces = async (
    location: { lat: number; lng: number },
    type: string = 'point_of_interest',
    radius: number = 5000
): Promise<PlaceResult[]> => {
    // 1. If no API Key, return High-Fidelity Mock Data
    if (!PLACES_API_KEY || PLACES_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('Google Places API Key missing. Using Live-Mock Data.');

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        // Filter mocks based on requested type (loose matching for demo)
        // In a real mock, we'd have more granular mocks
        return MOCK_PLACES.map(place => ({
            ...place,
            // Randomize distance slightly to simulate "nearby"
            geometry: {
                location: {
                    lat: location.lat + (Math.random() * 0.02 - 0.01),
                    lng: location.lng + (Math.random() * 0.02 - 0.01)
                }
            }
        }));
    }

    // 2. Real API Call - Search for multiple specific types
    try {
        console.log('📡 Calling proxyGooglePlaces Cloud Function...');

        const { getFunctions, httpsCallable } = await import('firebase/functions');
        const functions = getFunctions();
        const searchPlaces = httpsCallable(functions, 'proxyGooglePlaces');

        // Define specific resource types to search for
        const resourceTypes = [
            'pharmacy',           // Pharmacies
            'hospital',          // Hospitals/Medical
            'doctor',            // Doctor offices
            'health',            // Health centers
            'lodging',           // Hotels (shelter proxy)
            'restaurant',        // Restaurants (food bank proxy)
            'meal_delivery',     // Meal services
            'meal_takeaway',     // Food services
            'grocery_or_supermarket', // Grocery stores
            'food'               // General food establishments
        ];

        // Perform parallel searches for all resource types via Proxy
        const searchPromises = resourceTypes.map(async (searchType) => {
            try {
                const response = await searchPlaces({
                    location: location,
                    radius: radius,
                    type: searchType
                });

                const data = response.data as any;
                return data.results || [];
            } catch (err) {
                console.warn(`Failed to fetch ${searchType} via proxy:`, err);
                return [];
            }
        });

        const allResults = await Promise.all(searchPromises);

        // Flatten and deduplicate results by place_id
        const uniquePlaces = new Map<string, PlaceResult>();
        allResults.flat().forEach(place => {
            if (place.place_id && !uniquePlaces.has(place.place_id)) {
                uniquePlaces.set(place.place_id, place);
            }
        });

        const results = Array.from(uniquePlaces.values());

        // If we got results, return them; otherwise fall back to mock
        return results.length > 0 ? results : MOCK_PLACES;

    } catch (error) {
        console.error('Error fetching places via proxy:', error);
        return MOCK_PLACES; // Fallback to mock on error
    }
};

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // 1. If no API Key, use Mock
    if (!PLACES_API_KEY || PLACES_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('Geocoding API Key missing. Using Mock.');
        return { lat: 40.7128, lng: -74.0060 }; // Default NYC
    }

    try {
        // USE PROXY on localhost to avoid CORS
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? '/api/google'
            : 'https://maps.googleapis.com/maps/api';

        const url = `${baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${PLACES_API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
            return data.results[0].geometry.location;
        } else {
            console.warn('Geocoding found no results:', data.status);
            return null;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback to random offset for demo continuity if net fails
        return {
            lat: 40.7128 + (Math.random() * 0.1),
            lng: -74.0060 - (Math.random() * 0.1)
        };
    }
};

export const getPlacePhotoUrl = (photoReference: string, maxWidth: number = 400) => {
    if (!PLACES_API_KEY) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${PLACES_API_KEY}`;
};
