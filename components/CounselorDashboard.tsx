import React, { useState, useEffect } from 'react';
import { User, UserRole, Mission } from '../types';
import { CheckCircle, XCircle, Search, Download, ShieldCheck, Mail } from 'lucide-react';

interface CounselorDashboardProps {
    currentUser: User;
}

// Mock Data for students (simulate fetching from Firestore)
const MOCK_STUDENTS: Partial<User>[] = [
    {
        id: 'student-1',
        name: 'Alex Rivera',
        email: 'alex.r@highschool.edu',
        role: UserRole.STUDENT,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        studentData: {
            schoolId: 'lincoln-high',
            schoolName: 'Lincoln High School',
            graduationYear: 2025,
            counselorEmail: 'counselor@highschool.edu',
            verifiedHours: 45.5,
            pendingHours: 3.5,
            certificates: []
        }
    },
    {
        id: 'student-2',
        name: 'Sarah Chen',
        email: 'sarah.c@highschool.edu',
        role: UserRole.STUDENT,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        studentData: {
            schoolId: 'lincoln-high',
            schoolName: 'Lincoln High School',
            graduationYear: 2026,
            counselorEmail: 'counselor@highschool.edu',
            verifiedHours: 12.0,
            pendingHours: 2.0,
            certificates: []
        }
    }
];

const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ currentUser }) => {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [searchQuery, setSearchQuery] = useState('');

    const handleVerifyHours = (studentId: string, hours: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId && s.studentData) {
                return {
                    ...s,
                    studentData: {
                        ...s.studentData,
                        verifiedHours: s.studentData.verifiedHours + hours,
                        pendingHours: 0
                    }
                };
            }
            return s;
        }));
        // In real app: Call Firestore API to update student document
    };

    const handleRejectHours = (studentId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId && s.studentData) {
                return {
                    ...s,
                    studentData: {
                        ...s.studentData,
                        pendingHours: 0
                    }
                };
            }
            return s;
        }));
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentData?.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 h-full overflow-y-auto pb-24 bg-slate-50 dark:bg-slate-900">
            <header className="mb-8">
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" /> Counselor Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Manage student volunteer hours and verify service.</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Students</h3>
                    <p className="text-3xl font-black dark:text-white">{students.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Hours</h3>
                    <p className="text-3xl font-black text-orange-500">
                        {students.reduce((acc, s) => acc + (s.studentData?.pendingHours || 0), 0).toFixed(1)} hrs
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Service Value</h3>
                    <p className="text-3xl font-black text-green-500">$1,450</p>
                    <p className="text-xs text-slate-400">Est. value @ $25/hr</p>
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-600">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4 text-center">Verified</th>
                                <th className="px-6 py-4 text-center">Pending</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatarUrl} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="font-bold dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-400">{student.studentData?.graduationYear}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {student.studentData?.schoolName}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        {student.studentData?.verifiedHours} hrs
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {student.studentData?.pendingHours && student.studentData.pendingHours > 0 ? (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                                                {student.studentData.pendingHours} hrs
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {student.studentData?.pendingHours && student.studentData.pendingHours > 0 ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleRejectHours(student.id!)}
                                                    className="p-1 text-red-400 hover:bg-red-50 rounded" title="Reject">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyHours(student.id!, student.studentData!.pendingHours)}
                                                    className="p-1 text-green-500 hover:bg-green-50 rounded" title="Verify">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="text-xs text-indigo-600 hover:underline flex items-center justify-end gap-1 w-full">
                                                <Mail className="w-3 h-3" /> Email
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        <p>No students found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CounselorDashboard;
