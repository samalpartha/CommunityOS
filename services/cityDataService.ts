import { Mission, MissionType, MissionStatus } from '../types';

// API Endpoints for Open Data Portals
const API_ENDPOINTS = {
    NYC: 'https://data.cityofnewyork.us/resource/erm2-nwe9.json', // 311 Service Requests
    SF: 'https://data.sfgov.org/resource/vw6y-z8j6.json',
    CHI: 'https://data.cityofchicago.org/resource/v6vf-nfxy.json'
};

// 311 Complaint Types mapping to CommunityOS Mission Types
const ISSUE_MAPPINGS: Record<string, { type: MissionType; title: string; reward: number }> = {
    // NYC Types
    'Pothole': { type: MissionType.FIX_BOUNTY, title: 'Reported Pothole', reward: 50 },
    'Graffiti': { type: MissionType.FIX_BOUNTY, title: 'Graffiti Removal', reward: 40 },
    'Street Light Out': { type: MissionType.FIX_BOUNTY, title: 'Dark Street Alert', reward: 30 },
    'Dirty Conditions': { type: MissionType.FIX_BOUNTY, title: 'Street Cleanup Needed', reward: 40 },
    'Blocked Driveway': { type: MissionType.FIX_BOUNTY, title: 'Blocked Driveway Check', reward: 20 },

    // SF Types
    'Street and Sidewalk Cleaning': { type: MissionType.FIX_BOUNTY, title: 'Sidewalk Cleanup', reward: 30 },
    'Graffiti Private Property': { type: MissionType.FIX_BOUNTY, title: 'Graffiti Clean-up', reward: 40 },

    // Chicago Types
    'Pot Hole in Street': { type: MissionType.FIX_BOUNTY, title: 'Pothole Alert', reward: 50 },
    'Graffiti Removal': { type: MissionType.FIX_BOUNTY, title: 'Graffiti Cleanup', reward: 40 }
};

interface City311Report {
    unique_key: string;
    created_date: string; // ISO string
    complaint_type: string;
    descriptor?: string;
    location?: {
        latitude: string;
        longitude: string;
    };
    status: string;
    street_name?: string;
    borough?: string;
}

/**
 * Fetch recent 311 reports from NYC Open Data
 */
export async function fetchRecentNYCReports(limit: number = 20): Promise<Mission[]> {
    try {
        // Query recently created, open items that have location data
        // Socrata Query Language (SoQL)
        const query = `$limit=${limit}&$where=status='Open' AND latitude IS NOT NULL AND longitude IS NOT NULL AND created_date > '${getYesterdayDate()}'&$order=created_date DESC`;

        const response = await fetch(`${API_ENDPOINTS.NYC}?${query}`);

        if (!response.ok) {
            throw new Error(`NYC Open Data API error: ${response.statusText}`);
        }

        const data: City311Report[] = await response.json();
        return normalizeReports(data, 'NYC');
    } catch (error) {
        console.error('Error fetching NYC 311 data:', error);
        return [];
    }
}

/**
 * Filter and normalize raw 311 data into CommunityOS Missions
 */
function normalizeReports(reports: City311Report[], source: 'NYC' | 'SF' | 'CHI'): Mission[] {
    return reports
        .filter(report => ISSUE_MAPPINGS[report.complaint_type]) // Only keep relevant issues
        .map(report => {
            const mapping = ISSUE_MAPPINGS[report.complaint_type];

            return {
                id: `311-${source}-${report.unique_key}`,
                type: mapping.type,
                title: mapping.title,
                description: `Verified 311 Report: ${report.descriptor || report.complaint_type}. Location: ${report.street_name || 'Unknown St'}, ${report.borough || ''}`,
                location: `${report.street_name || 'Nearby'}, ${report.borough || ''}`,
                coordinates: {
                    lat: parseFloat(report.location?.latitude || '0'),
                    lng: parseFloat(report.location?.longitude || '0')
                },
                distance: '0.5 mi', // Placeholder, calculate real distance in UI
                reward: mapping.reward,
                status: MissionStatus.OPEN,
                urgency: 'MEDIUM',
                timeEstimate: '30 mins',
                autoImported: true,
                cityReportsId: report.unique_key,
                citySource: source,
                verifiedSource: `${source} 311 Open Data`,
                fixData: {
                    severity: 'MEDIUM',
                    imageUrl: undefined // 311 often doesn't give images in basic view
                }
            };
        });
}

function getYesterdayDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 2); // Get last 48 hours to be safe
    return date.toISOString().split('.')[0]; // Remove ms for SoQL compatibility if needed
}
