import { collection, getDocs, addDoc, updateDoc, doc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Mission, MissionStatus, User } from '../types';

export const getMissions = async (): Promise<Mission[]> => {
    const querySnapshot = await getDocs(collection(db, "missions"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
};

export const subscribeToMissions = (callback: (missions: Mission[]) => void) => {
    const q = query(collection(db, "missions"));
    return onSnapshot(q, (snapshot) => {
        const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
        callback(missions);
    });
};

export const addMission = async (mission: Omit<Mission, 'id'>) => {
    return await addDoc(collection(db, "missions"), mission);
};


export const updateMissionStatus = async (id: string, status: MissionStatus) => {
    const missionRef = doc(db, "missions", id);
    await updateDoc(missionRef, { status });
};

// Temporary Seeding Function
import { INITIAL_MISSIONS } from '../constants';
// Update user profile
export const updateProfile = async (user: User) => {
    try {
        const userRef = doc(db, 'users', user.id);
        // Remove undefined fields if any, or use { merge: true }
        // Simple spread to update fields
        await setDoc(userRef, user, { merge: true });
        console.log("Updated user profile:", user.id);
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const seedMissions = async () => {
    const missionsRef = collection(db, "missions");
    const snapshot = await getDocs(missionsRef);
    if (!snapshot.empty) {
        console.log("Database already has missions. Skipping seed.");
        return;
    }

    console.log("Seeding database...");
    for (const mission of INITIAL_MISSIONS) {
        const { id, ...missionData } = mission; // Let Firestore generate ID or use strict IDs if preferred
        // We will let Firestore generate IDs for simplicity in this demo, or we could use setDoc with mission.id
        await addDoc(missionsRef, missionData);
    }
    console.log("Seeding complete!");
};
