import { collection, doc, onSnapshot, setDoc, query, where, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ActiveUser, UserRole } from '../types';

export const updateUserStatus = async (userId: string, data: Partial<ActiveUser>) => {
    try {
        const userRef = doc(db, 'active_users', userId);
        await setDoc(userRef, {
            ...data,
            lastActive: serverTimestamp() // Use server timestamp for consistency
        }, { merge: true });
    } catch (error) {
        console.error("Error updating user status:", error);
    }
};

export const subscribeToActiveUsers = (callback: (users: ActiveUser[]) => void) => {
    // In a real app, we might limit this query to a geographic region (Geohash)
    // For now, we get all active users who have updated in the last 5 minutes.
    // Note: Firestore query limits might require composite indexes. 
    // To keep it simple for this hackathon/demo, we'll fetch all and filter in memory if needed, 
    // or just fetch all 'active_users' assuming the collection is cleaned up by a cloud function.

    // For this implementation, we will fetch all docs effectively.
    // A robust impl would use: where('lastActive', '>', Timestamp.fromMillis(Date.now() - 5 * 60 * 1000))

    const q = query(collection(db, 'active_users'));

    return onSnapshot(q, (snapshot) => {
        const users: ActiveUser[] = [];
        const now = Date.now();

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // simple client-side filter for stale users (older than 10 mins) to avoid clutter
            // assuming 'lastActive' is a Firestore Timestamp
            let lastActiveTime = 0;
            if (data.lastActive?.toMillis) {
                lastActiveTime = data.lastActive.toMillis();
            } else if (typeof data.lastActive === 'string') {
                // Fallback if stored as string
                lastActiveTime = new Date(data.lastActive).getTime();
            }

            if (now - lastActiveTime < 10 * 60 * 1000) {
                users.push({
                    id: doc.id,
                    location: data.location,
                    role: data.role as UserRole,
                    status: data.status,
                    lastActive: data.lastActive // Keep original object or format string if needed by UI
                } as ActiveUser);
            }
        });
        callback(users);
    });
};

export const setSwarmStatus = async (isActive: boolean) => {
    try {
        const systemRef = doc(db, 'system_state', 'global');
        await setDoc(systemRef, {
            swarmMode: isActive,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error setting swarm status:", error);
    }
};

export const subscribeToSwarmStatus = (callback: (isActive: boolean) => void) => {
    const systemRef = doc(db, 'system_state', 'global');
    return onSnapshot(systemRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data().swarmMode || false);
        } else {
            callback(false);
        }
    });
};
