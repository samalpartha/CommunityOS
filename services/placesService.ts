import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { CommunityResource, ResourceType } from '../types';

// Google Places API configuration

// Google Places API configuration
declare var google: any;

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

// Resource type to Google Places type mapping
const RESOURCE_TYPE_MAP: Record<ResourceType, string> = {
    FOOD_BANK: 'food', // Will filter by name containing 'food bank'
    HOSPITAL: 'hospital',
    SHELTER: 'lodging',
    PHARMACY: 'pharmacy',
    COMMUNITY_CENTER: 'community_center'
};

let googleMapsPromise: Promise<void> | null = null;

/**
 * Dynamically load Google Maps script
 */
function loadGoogleMapsScript(): Promise<void> {
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        if ((window as any).google && (window as any).google.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });

    return googleMapsPromise;
}

/**
 * Geocode an address or zip code to coordinates using Google Maps JS API
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!PLACES_API_KEY) {
        console.warn('Google Maps API key not configured');
        return null;
    }

    try {
        await loadGoogleMapsScript();
        const geocoder = new google.maps.Geocoder();

        const result = await new Promise<any[]>((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results) {
                    resolve(results);
                } else {
                    reject(status);
                }
            });
        });

        if (result && result.length > 0) {
            const location = result[0].geometry.location;
            return { lat: location.lat(), lng: location.lng() };
        }
        return null;
    } catch (error) {
        console.warn('Geocoding failed:', error);
        return null;
    }
}

/**
 * Search for places near a location using Google Places JS API
 */
export async function searchNearbyPlaces(
    location: { lat: number; lng: number },
    resourceType: ResourceType,
    radius: number = 5000 // 5km default
): Promise<CommunityResource[]> {
    if (!PLACES_API_KEY) {
        console.warn('Google Places API key not configured, using cached data only');
        return [];
    }

    try {
        await loadGoogleMapsScript();
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const placeType = RESOURCE_TYPE_MAP[resourceType];

        const request: any = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: radius,
            type: placeType,
        };

        // Add keyword filtering for Food Banks
        if (resourceType === 'FOOD_BANK') {
            request.keyword = 'food bank';
        }

        const results = await new Promise<any[]>((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(results);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(status);
                }
            });
        });

        // Convert Google Places results to CommunityResource format
        return results
            .filter((place) => {
                // Additional client-side filtering if needed
                if (!place.place_id || !place.geometry?.location) return false;
                return true;
            })
            .map((place) => ({
                id: place.place_id!,
                name: place.name || 'Unknown Place',
                type: resourceType,
                description: place.vicinity || getDescriptionForType(resourceType, place),
                location: {
                    lat: place.geometry!.location!.lat(),
                    lng: place.geometry!.location!.lng(),
                    address: place.vicinity || ''
                },
                contact: {
                    phone: 'Call for info',
                    hours: place.opening_hours ? 'Check hours' : 'N/A'
                },
                services: getServicesForType(resourceType),
                verified: true,
                lastUpdated: new Date()
            }));

    } catch (error) {
        console.error('Error fetching places:', error);
        return [];
    }
}

/**
 * Get resources from Firestore cache (Legacy/Fallback)
 */
export async function getCachedResources(cityId: string = 'default'): Promise<CommunityResource[]> {
    try {
        const resourcesRef = collection(db, 'cached_resources');
        const q = query(resourcesRef, where('cityId', '==', cityId));
        const snapshot = await getDocs(q);

        const resources: CommunityResource[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            resources.push({
                ...data,
                lastUpdated: data.lastUpdated?.toDate() || new Date()
            } as CommunityResource);
        });

        return resources;
    } catch (error) {
        console.error('Error fetching cached resources:', error);
        return [];
    }
}

/**
 * Main function to get resources with smart caching
 */
export async function getResources(
    location: { lat: number; lng: number },
    cityId: string = 'default',
    forceRefresh: boolean = false
): Promise<CommunityResource[]> {
    // If running in browser, prefer fresh API data via JS SDK to avoid CORS issues with REST 
    // And to provide better user experience. Caching is nice but JS SDK is free for Maps users (ish).
    // Actually, Places API costs money. But we want it to work.

    // We can still try cache first if available
    if (!forceRefresh && await isCacheFresh(cityId)) {
        console.log('Using cached resource data');
        return getCachedResources(cityId);
    }

    // Fetch fresh data from API
    console.log('Fetching fresh resource data from Google Places JS API');
    const allResources: CommunityResource[] = [];

    // Fetch each resource type
    for (const type of Object.keys(RESOURCE_TYPE_MAP) as ResourceType[]) {
        const places = await searchNearbyPlaces(location, type);
        allResources.push(...places);
    }

    // Deduplicate resources by ID to prevent React key errors
    const uniqueResources = Array.from(new Map(allResources.map(item => [item.id, item])).values());

    return uniqueResources;
}

// Helpers...
export async function isCacheFresh(cityId: string = 'default'): Promise<boolean> {
    // Return false if permission denied, effectively bypassing cache
    try {
        const metaRef = doc(db, 'cache_metadata', cityId);
        const metaDoc = await getDoc(metaRef);
        if (!metaDoc.exists()) return false;
        const lastUpdate = metaDoc.data().lastUpdate?.toDate();
        if (!lastUpdate) return false;
        return (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60) < 24;
    } catch (error) {
        // console.warn('Cache check failed (likely permissions), fetching fresh:', error);
        return false;
    }
}


function getDescriptionForType(type: ResourceType, place: any): string {
    const descriptions: Record<ResourceType, string> = {
        FOOD_BANK: 'Free food assistance and groceries',
        HOSPITAL: 'Emergency and medical services',
        SHELTER: 'Temporary housing and support',
        PHARMACY: 'Medications and healthcare products',
        COMMUNITY_CENTER: 'Community programs and resources'
    };

    return descriptions[type] || 'Community Resource';
}

function getServicesForType(type: ResourceType): string[] {
    const services: Record<ResourceType, string[]> = {
        FOOD_BANK: ['Food distribution', 'Grocery assistance', 'Meal programs'],
        HOSPITAL: ['Emergency care', 'Medical treatment', 'Urgent care'],
        SHELTER: ['Emergency housing', 'Support services', 'Referrals'],
        PHARMACY: ['Prescriptions', 'Over-the-counter', 'Consultations'],
        COMMUNITY_CENTER: ['Programs', 'Activities', 'Resources']
    };

    return services[type] || [];
}

