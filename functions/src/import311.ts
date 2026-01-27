import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Re-implement fetching logic here since we can't easily import from the React app source
// in the Cloud Functions environment without complex build steps.
// Ideally, we'd have a shared library, but for now we duplicate the fetch logic.

const db = admin.firestore();

const API_ENDPOINTS = {
    NYC: 'https://data.cityofnewyork.us/resource/erm2-nwe9.json',
};

const ISSUE_MAPPINGS: Record<string, { type: string; title: string; reward: number }> = {
    'Pothole': { type: 'FIX_BOUNTY', title: 'Reported Pothole', reward: 50 },
    'Graffiti': { type: 'FIX_BOUNTY', title: 'Graffiti Removal', reward: 40 },
    'Street Light Out': { type: 'FIX_BOUNTY', title: 'Dark Street Alert', reward: 30 },
    'Dirty Conditions': { type: 'FIX_BOUNTY', title: 'Street Cleanup Needed', reward: 40 },
    'Blocked Driveway': { type: 'FIX_BOUNTY', title: 'Blocked Driveway Check', reward: 20 },
};

export const importCityReports = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        console.log('Starting 311 data import...');

        try {
            const reports = await fetchRecentNYCReports();
            console.log(`Fetched ${reports.length} recent reports from NYC 311`);

            let newCount = 0;
            const batch = db.batch();
            let batchCount = 0;

            for (const report of reports) {
                const missionId = `311-NYC-${report.unique_key}`;
                const missionRef = db.collection('missions').doc(missionId);

                const doc = await missionRef.get();

                if (!doc.exists) {
                    // Create new mission
                    const mapping = ISSUE_MAPPINGS[report.complaint_type];
                    if (!mapping) continue;

                    const missionData = {
                        type: mapping.type,
                        title: mapping.title,
                        description: `Verified 311 Report: ${report.descriptor || report.complaint_type}. Location: ${report.street_name || 'Unknown St'}, ${report.borough || ''}`,
                        location: `${report.street_name || 'Nearby'}, ${report.borough || ''}`,
                        coordinates: {
                            lat: parseFloat(report.location?.latitude || '0'),
                            lng: parseFloat(report.location?.longitude || '0')
                        },
                        reward: mapping.reward,
                        status: 'OPEN',
                        urgency: 'MEDIUM',
                        timeEstimate: '30 mins',
                        autoImported: true,
                        cityReportsId: report.unique_key,
                        citySource: 'NYC',
                        verifiedSource: 'NYC 311 Open Data',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        fixData: {
                            severity: 'MEDIUM'
                        }
                    };

                    batch.set(missionRef, missionData);
                    newCount++;
                    batchCount++;

                    // Commit batch every 500 items (Firestore limit)
                    if (batchCount >= 400) {
                        await batch.commit();
                        batchCount = 0;
                    }
                }
            }

            if (batchCount > 0) {
                await batch.commit();
            }

            console.log(`Successfully imported ${newCount} new missions from 311 data.`);
            return null;

        } catch (error) {
            console.error('Error importing 311 data:', error);
            return null;
        }
    });

async function fetchRecentNYCReports() {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Last 24 hours
    const yesterday = date.toISOString().split('.')[0];

    const query = `$limit=50&$where=status='Open' AND latitude IS NOT NULL AND longitude IS NOT NULL AND created_date > '${yesterday}'&$order=created_date DESC`;

    const response = await fetch(`${API_ENDPOINTS.NYC}?${query}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    return await response.json();
}
