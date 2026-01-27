import jsPDF from 'jspdf';
import { User, Certificate } from '../types';

export const generateCertificate = (user: User): void => {
    if (!user.studentData) {
        console.error('User is not a student');
        return;
    }

    const { schoolName, graduationYear, verifiedHours } = user.studentData;

    // Create PDF
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Background
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setFontSize(36);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Volunteer Service', 148.5, 50, { align: 'center' });

    // Presentation text
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('This certifies that', 148.5, 70, { align: 'center' });

    // Student Name
    doc.setFontSize(28);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, 148.5, 90, { align: 'center' });

    // School info
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`${schoolName} • Class of ${graduationYear}`, 148.5, 102, { align: 'center' });

    // Hours completed
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('has successfully completed', 148.5, 120, { align: 'center' });

    doc.setFontSize(48);
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.text(`${verifiedHours} Hours`, 148.5, 142, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('of verified community volunteer service through Community Hero', 148.5, 155, { align: 'center' });

    // Date and signature area
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    // Date
    doc.text(`Issue Date: ${today}`, 40, 180);

    // Signature line
    doc.setLineWidth(0.3);
    doc.line(200, 178, 257, 178);
    doc.text('Community Hero Platform', 228.5, 185, { align: 'center' });

    // Trust score badge
    doc.setFillColor(79, 70, 229);
    doc.circle(35, 35, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Trust Score', 35, 33, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.trustScore}`, 35, 39, { align: 'center' });

    // Save PDF
    const fileName = `Community_Hero_Certificate_${user.name.replace(/\s+/g, '_')}_${verifiedHours}hrs.pdf`;
    doc.save(fileName);
};

export const exportAllCertificates = (user: User): void => {
    if (!user.studentData?.certificates || user.studentData.certificates.length === 0) {
        console.error('No certificates to export');
        return;
    }

    // For now, just generate the main certificate
    // In future, could generate tier-specific certificates
    generateCertificate(user);
};
