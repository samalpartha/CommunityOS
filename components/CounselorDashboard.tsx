import React, { useState, useEffect } from 'react';
import { User, UserRole, Mission } from '../types';
import { approveHours } from '../services/educationService';
import { CheckCircle, XCircle, Search, Download, ShieldCheck, Mail } from 'lucide-react';

interface CounselorDashboardProps {
    currentUser: User;
}

// Mock Data for students (simulate fetching from Firestore)
// Mock Data for students (simulate fetching from Firestore)
const MOCK_STUDENTS: { id: string; user: User }[] = [
    {
        id: 'student-1',
        user: {
            id: 'student-1',
            name: 'Alex Rivera',
            email: 'alex.r@highschool.edu',
            role: UserRole.STUDENT,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            impactCredits: 0,
            badges: [],
            streak: 0,
            lastLoginDate: new Date().toISOString(),
            trustScore: 100,
            studentData: {
                schoolId: 'lincoln-high',
                schoolName: 'Lincoln High School',
                graduationYear: 2025,
                counselorEmail: 'counselor@highschool.edu',
                verifiedHours: 45.5,
                pendingHours: 3.5,
                certificates: []
            }
        }
    },
    {
        id: 'student-2',
        user: {
            id: 'student-2',
            name: 'Sarah Chen',
            email: 'sarah.c@highschool.edu',
            role: UserRole.STUDENT,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            impactCredits: 0,
            badges: [],
            streak: 0,
            lastLoginDate: new Date().toISOString(),
            trustScore: 100,
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
    }
];

const CounselorDashboard: React.FC<CounselorDashboardProps> = ({ currentUser }) => {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');

    const handleVerifyHours = async (studentId: string, hours: number) => {
        // Optimistic UI Update
        setStudents(prev => prev.map(s => {
            if (s.id === studentId && s.user?.studentData) {
                return {
                    ...s,
                    user: {
                        ...s.user,
                        studentData: {
                            ...s.user.studentData!,
                            verifiedHours: (s.user.studentData?.verifiedHours || 0) + hours,
                            pendingHours: 0
                        }
                    }
                };
            }
            return s;
        }));

        // Call Backend Service
        try {
            await approveHours(studentId, hours, currentUser.email || 'counselor@school.edu');
            console.log('Hours approved successfully on backend');
        } catch (error) {
            console.error('Failed to approve on backend, rolling back needs implementation', error);
            // In a real app complexity: Rollback optimistic update
        }
    };

    const handleRejectHours = (studentId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId && s.user?.studentData) {
                return {
                    ...s,
                    user: {
                        ...s.user,
                        studentData: {
                            ...s.user.studentData!,
                            pendingHours: 0
                        }
                    }
                };
            }
            return s;
        }));
    };

    const pendingStudents = students.filter(s => (s.user?.studentData?.pendingHours || 0) > 0);
    const allStudents = students.filter(s =>
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user?.studentData?.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 h-full overflow-y-auto pb-24 bg-slate-50 dark:bg-slate-900">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" /> Counselor Dashboard
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage student volunteer hours and verify service.</p>
                </div>

                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Approvals
                        {pendingStudents.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingStudents.length}</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Students</h3>
                            <p className="text-3xl font-black dark:text-white">{students.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Approval</h3>
                            <p className="text-3xl font-black text-orange-500 relative z-10">
                                {students.reduce((acc, s) => acc + (s.user?.studentData?.pendingHours || 0), 0).toFixed(1)} hrs
                            </p>
                            {pendingStudents.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('approvals')}
                                    className="absolute bottom-4 right-4 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                                >
                                    Review Now
                                </button>
                            )}
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Community Impact</h3>
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
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white">
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
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {allStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={student.user?.avatarUrl} className="w-8 h-8 rounded-full" />
                                                    <div>
                                                        <p className="font-bold dark:text-white">{student.user?.name}</p>
                                                        <p className="text-xs text-slate-400">{student.user?.studentData?.graduationYear}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {student.user?.studentData?.schoolName}
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono dark:text-slate-300">
                                                {student.user?.studentData?.verifiedHours} hrs
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.user?.studentData?.pendingHours && student.user.studentData.pendingHours > 0 ? (
                                                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-bold">
                                                        Needs Approval
                                                    </span>
                                                ) : (
                                                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-bold">
                                                        Up to Date
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs text-indigo-600 hover:underline flex items-center justify-end gap-1 w-full">
                                                    <Mail className="w-3 h-3" /> Email
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Queue */}
            {activeTab === 'approvals' && (
                <div className="animate-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
                    {pendingStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">All Caught Up!</h3>
                            <p className="text-slate-500 mb-6">No pending hours to verify.</p>
                            <button onClick={() => setActiveTab('overview')} className="text-indigo-600 font-bold hover:underline">Return to Overview</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-500 uppercase text-xs">Pending Requests ({pendingStudents.length})</h3>
                                <button className="text-indigo-600 text-xs font-bold hover:underline">Approve All</button>
                            </div>

                            {pendingStudents.map(student => (
                                <div key={student.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <img src={student.user?.avatarUrl} className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">{student.user?.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{student.user?.studentData?.schoolName}</p>
                                            <div className="mt-2 text-xs flex items-center gap-2">
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">Mission: Community Clean Up</span>
                                                <span className="text-slate-400">Oct 24, 2024</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Claimed</p>
                                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{student.user?.studentData?.pendingHours} hrs</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRejectHours(student.id!)}
                                                className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => handleVerifyHours(student.id!, student.user?.studentData!.pendingHours)}
                                                className="p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors shadow-sm"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CounselorDashboard;
