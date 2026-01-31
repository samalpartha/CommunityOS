"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCityReports = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Re-implement fetching logic here since we can't easily import from the React app source
// in the Cloud Functions environment without complex build steps.
// Ideally, we'd have a shared library, but for now we duplicate the fetch logic.
const db = admin.firestore();
const API_ENDPOINTS = {
    NYC: 'https://data.cityofnewyork.us/resource/erm2-nwe9.json',
};
const ISSUE_MAPPINGS = {
    'Pothole': { type: 'FIX_BOUNTY', title: 'Reported Pothole', reward: 50 },
    'Graffiti': { type: 'ENVIRONMENTAL', title: 'Graffiti Removal', reward: 40 },
    'Street Light Out': { type: 'SAFETY_PATROL', title: 'Dark Street Alert', reward: 30 },
    'Dirty Conditions': { type: 'ENVIRONMENTAL', title: 'Street Cleanup Needed', reward: 40 },
    'Blocked Driveway': { type: 'SAFETY_PATROL', title: 'Blocked Driveway Check', reward: 20 },
};
exports.importCityReports = functions.pubsub
    .schedule('every 6 hours')
    .timeZone('America/New_York')
    .onRun(async (context) => {
    var _a, _b;
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
                if (!mapping)
                    continue;
                const baseMissionData = {
                    type: mapping.type,
                    title: mapping.title,
                    description: `Verified 311 Report: ${report.descriptor || report.complaint_type}. Location: ${report.street_name || 'Unknown St'}, ${report.borough || ''}`,
                    location: `${report.street_name || 'Nearby'}, ${report.borough || ''}`,
                    coordinates: {
                        lat: parseFloat(((_a = report.location) === null || _a === void 0 ? void 0 : _a.latitude) || '0'),
                        lng: parseFloat(((_b = report.location) === null || _b === void 0 ? void 0 : _b.longitude) || '0')
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
                };
                let typeSpecificData = {};
                if (mapping.type === 'FIX_BOUNTY') {
                    typeSpecificData = { fixData: { severity: 'MEDIUM' } };
                }
                else if (mapping.type === 'ENVIRONMENTAL') {
                    typeSpecificData = {
                        ecoData: {
                            activityType: 'CLEANUP',
                            targetMetric: '1 Area'
                        }
                    };
                }
                else if (mapping.type === 'SAFETY_PATROL') {
                    typeSpecificData = {
                        safetyData: {
                            patrolRoute: 'Single Point Check',
                            reportCount: 1
                        }
                    };
                }
                batch.set(missionRef, Object.assign(Object.assign({}, baseMissionData), typeSpecificData));
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
    }
    catch (error) {
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
    if (!response.ok)
        throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
}
//# sourceMappingURL=import311.js.map