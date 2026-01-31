import { Mission, MissionType, MissionStatus } from '../types';

// Real-world 311 categories mapped to our Mission Types
const CITY_DATA_MAPPING: Record<string, MissionType> = {
    'Pothole': MissionType.FIX_BOUNTY,
    'Graffiti': MissionType.FIX_BOUNTY,
    'Street Light Out': MissionType.FIX_BOUNTY,
    'Trash Pickup': MissionType.ENVIRONMENTAL, // Changed from CLEANUP_EVENT
    'Sidewalk Damage': MissionType.FIX_BOUNTY
};

interface CityReport {
    unique_key: string;
    created_date: string;
    complaint_type: string;
    descriptor: string;
    incident_address: string;
    latitude: string;
    longitude: string;
    status: string;
}

// Mock Data for "Live" Demo
const MOCK_311_REPORTS: CityReport[] = [
    {
        unique_key: '311-1001',
        created_date: new Date().toISOString(),
        complaint_type: 'Pothole',
        descriptor: 'Large pothole causing traffic slowdown',
        incident_address: 'Main St & 4th Ave',
        latitude: '37.7760',
        longitude: '-122.4180',
        status: 'Open'
    },
    {
        unique_key: '311-1002',
        created_date: new Date().toISOString(),
        complaint_type: 'Street Light Out',
        descriptor: 'Street light flickering constantly',
        incident_address: '1500 Market St',
        latitude: '37.7730',
        longitude: '-122.4220',
        status: 'Open'
    },
    {
        unique_key: '311-1003',
        created_date: new Date().toISOString(),
        complaint_type: 'Graffiti',
        descriptor: 'Tagging on public park bench',
        incident_address: 'Golden Gate Park Entrance',
        latitude: '37.7690',
        longitude: '-122.4500',
        status: 'Open'
    },
    {
        unique_key: '311-1004',
        created_date: new Date().toISOString(),
        complaint_type: 'Trash Pickup',
        descriptor: 'Overflowing public trash can',
        incident_address: 'Dolores Park',
        latitude: '37.7600',
        longitude: '-122.4270',
        status: 'Open'
    }
];

export const fetchCityDataMissions = async (
    lat: number,
    lng: number,
    radius: number = 5000
): Promise<Mission[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // In a real app, we would fetch from: https://data.cityofnewyork.us/resource/erm2-nwe9.json
    // For this demo, we use high-fidelity mocks randomized around the user

    return MOCK_311_REPORTS.map(report => {
        // Randomize location slightly around the user if needed, or use static mock coords
        // For better demo feel, let's put them relative to the user's "center"
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const offsetLng = (Math.random() - 0.5) * 0.01;

        return {
            id: report.unique_key,
            title: `City Fix: ${report.complaint_type}`,
            description: `${report.descriptor}. Reported via 311. Verified by City Data.`,
            type: CITY_DATA_MAPPING[report.complaint_type] || MissionType.FIX_BOUNTY,
            status: MissionStatus.OPEN,
            location: report.incident_address, // String location
            coordinates: {
                lat: lat + offsetLat, // Use user location + offset for instant "nearby" feel
                lng: lng + offsetLng
            },
            reward: 150, // Standard city bounty
            credits: 150, // Deprecated but widely used
            // New Required Fields
            distance: '0.4 mi', // Mock distance
            urgency: 'MEDIUM',
            timeEstimate: '45 mins',
            createdAt: new Date(report.created_date),
            isOfficial: true, // New flag for UI
            verifiedSource: 'City of Springfield' // Changed to string to match type
        } as unknown as Mission;
    });
};
