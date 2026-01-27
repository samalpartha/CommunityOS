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
exports.counselorApproval = exports.verifyCertificate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
/**
 * HTTP Endpoint: verifyCertificate
 *
 * Allows external parties (schools, employers) to verify certificate authenticity
 */
exports.verifyCertificate = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const certData = certDoc.data();
        const userDoc = await db.collection('users').doc(certData.userId).get();
        if (!userDoc.exists) {
            res.status(404).json({ valid: false, error: 'User not found' });
            return;
        }
        const userData = userDoc.data();
        // Verify email matches (case-insensitive)
        const userEmail = (_a = userData.email) === null || _a === void 0 ? void 0 : _a.toLowerCase();
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
    }
    catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * HTTP Endpoint: counselorApproval
 *
 * Allows school counselors to approve pending volunteer hours
 */
exports.counselorApproval = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const userData = userDoc.data();
        // Verify student belongs to counselor's school
        if (((_a = userData.studentData) === null || _a === void 0 ? void 0 : _a.counselorEmail) !== counselorEmail) {
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
    }
    catch (error) {
        console.error('Error approving hours:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=index.js.map