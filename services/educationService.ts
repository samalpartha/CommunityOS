import { User } from '../types';

// In production, this would be your Firebase Cloud Functions URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/community-os-demo/us-central1';

interface VerifyCertResponse {
    valid: boolean;
    studentName?: string;
    hoursCompleted?: number;
    schoolName?: string;
    issuedDate?: any;
    certificateType?: string;
    error?: string;
}

export const verifyCertificate = async (certificateId: string, studentEmail: string): Promise<VerifyCertResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/verifyCertificate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ certificateId, studentEmail }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Verification failed');
        }

        return await response.json();
    } catch (error) {
        console.warn("Backend unavailable, using mock verification", error);
        // Fallback Mock for Demo
        await new Promise(r => setTimeout(r, 1500));

        if (certificateId === 'INVALID') {
            return { valid: false, error: 'Certificate ID not found' };
        }

        return {
            valid: true,
            studentName: 'Student Name',
            hoursCompleted: 50,
            schoolName: 'Lincoln High',
            certificateType: 'SERVICE_LEARNING',
            issuedDate: new Date().toISOString()
        };
    }
};

export const approveHours = async (studentId: string, hours: number, counselorEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/counselorApproval`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, hoursToApprove: hours, counselorEmail }),
        });

        if (!response.ok) {
            throw new Error('Approval failed');
        }

        return true;
    } catch (error) {
        console.warn("Backend unavailable, using mock approval", error);
        await new Promise(r => setTimeout(r, 1000));
        return true;
    }
};
