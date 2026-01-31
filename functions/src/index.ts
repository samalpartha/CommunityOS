import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * HTTP Endpoint: verifyCertificate
 * 
 * Allows external parties (schools, employers) to verify certificate authenticity
 */
export const verifyCertificate = functions.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { certificateId, studentEmail } = req.body;

    if (!certificateId || !studentEmail) {
        res.status(400).json({ error: 'Missing certificateId or studentEmail' });
        return;
    }

    try {
        const certDoc = await db.collection('certificates').doc(certificateId).get();

        if (!certDoc.exists) {
            res.status(404).json({ valid: false, error: 'Certificate not found' });
            return;
        }

        const certData = certDoc.data()!;
        const userDoc = await db.collection('users').doc(certData.userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ valid: false, error: 'User not found' });
            return;
        }

        const userData = userDoc.data()!;

        // Verify email matches (case-insensitive)
        const userEmail = userData.email?.toLowerCase();
        const inputEmail = studentEmail.toLowerCase();

        if (userEmail !== inputEmail) {
            res.status(403).json({ valid: false, error: 'Email does not match certificate' });
            return;
        }

        res.status(200).json({
            valid: true,
            studentName: userData.name,
            hoursCompleted: certData.hoursCompleted,
            schoolName: certData.schoolName,
            issuedDate: certData.issuedDate,
            certificateType: certData.type,
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * HTTP Endpoint: counselorApproval
 * 
 * Allows school counselors to approve pending volunteer hours
 */
export const counselorApproval = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { studentId, hoursToApprove, counselorEmail } = req.body;

    if (!studentId || !hoursToApprove || !counselorEmail) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const userRef = db.collection('users').doc(studentId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        const userData = userDoc.data()!;

        // Verify student belongs to counselor's school
        if (userData.studentData?.counselorEmail !== counselorEmail) {
            res.status(403).json({ error: 'Not authorized for this student' });
            return;
        }

        // Move hours from pending to verified
        await userRef.update({
            'studentData.verifiedHours': admin.firestore.FieldValue.increment(hoursToApprove),
            'studentData.pendingHours': admin.firestore.FieldValue.increment(-hoursToApprove),
        });

        // Create audit log
        await db.collection('audit_logs').add({
            userId: studentId,
            action: 'HOURS_VERIFIED_BY_COUNSELOR',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                hoursApproved: hoursToApprove,
                counselorEmail,
            },
        });

        res.status(200).json({ success: true, message: 'Hours approved successfully' });
    } catch (error) {
        console.error('Error approving hours:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export resource sync function
export { syncResourcesDaily } from './syncPlaces';
export { importCityReports } from './import311';
export { proxyGooglePlaces, proxyGeocode } from './placesProxy';


