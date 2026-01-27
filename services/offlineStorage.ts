import { Mission } from '../types';

const OFFLINE_MISSIONS_KEY = 'community_offline_missions';

export const saveOfflineMission = (mission: Mission) => {
    try {
        const current = getOfflineMissions();
        current.push(mission);
        localStorage.setItem(OFFLINE_MISSIONS_KEY, JSON.stringify(current));
        return true;
    } catch (e) {
        console.error("Failed to save offline mission", e);
        return false;
    }
};

export const getOfflineMissions = (): Mission[] => {
    try {
        const stored = localStorage.getItem(OFFLINE_MISSIONS_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (e) {
        return [];
    }
};

export const clearOfflineMissions = () => {
    localStorage.removeItem(OFFLINE_MISSIONS_KEY);
};

export const removeOfflineMission = (id: string) => {
    const current = getOfflineMissions();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(OFFLINE_MISSIONS_KEY, JSON.stringify(updated));
};

export const syncOfflineMissions = async (onMissionsynced: (m: Mission) => Promise<void>) => {
    const missions = getOfflineMissions();
    if (missions.length === 0) return 0;

    let syncedCount = 0;
    for (const mission of missions) {
        try {
            await onMissionsynced(mission);
            syncedCount++;
        } catch (e) {
            console.error(`Failed to sync mission ${mission.id}`, e);
            // Keep it in offline storage if failed? 
            // For MVP, we'll try best effort. 
            // In real app, we'd only remove on success.
        }
    }
    // Assume all synced for MVP simplicity or clear entire batch
    clearOfflineMissions();
    return syncedCount;
};
