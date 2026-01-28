import { collection, getDocs, addDoc, updateDoc, doc, query, where, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
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
export const getUserProfile = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDocs(query(collection(db, 'users'), where('id', '==', uid))); // Using query as fallback if doc ID differs
    // Actually best to try direct doc first
    const directSnap = await import('firebase/firestore').then(mod => mod.getDoc(docRef));

    if (directSnap.exists()) {
        return directSnap.data() as User;
    }
    return null;
};

export const createUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    return user;
};

// Update user profile
export const updateProfile = async (user: User) => {
    try {
        const userRef = doc(db, 'users', user.id);
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
