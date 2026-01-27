import React, { useState } from 'react';
import { User, UserRole, Mission } from '../types';
import { Wallet, Award, Plus, Sun, Moon, LogOut, HelpCircle, School, CheckCircle, AlertTriangle, Users, Map as MapIcon, Zap, Eye } from 'lucide-react';
import ServiceMap from './ServiceMap';
import SkillTreeModal from './SkillTreeModal';
import { updateProfile } from '../services/firestoreService';

interface ProfileViewProps {
    user: User;
    missions: Mission[];
    onToggleDarkMode: () => void;
    darkMode: boolean;
    onLogout: () => void;
    onShowHelp: () => void;
    onUpdateUser: (user: User) => void;
    addToast: (type: 'success' | 'error', title: string, message: string) => void;
    accessibilitySettings: { highContrast: boolean; bigButtons: boolean; };
    onUpdateAccessibility: (settings: { highContrast: boolean; bigButtons: boolean; }) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
    user,
    missions,
    onToggleDarkMode,
    darkMode,
    onLogout,
    onShowHelp,
    onUpdateUser,
    addToast,
    accessibilitySettings,
    onUpdateAccessibility
}) => {
    const [isThinking, setIsThinking] = useState(false);
    const [showServiceMap, setShowServiceMap] = useState(false);
    const [showSkillTree, setShowSkillTree] = useState(false);

    // Student Mode Form State
    const [isStudentMode, setIsStudentMode] = useState(user.role === UserRole.STUDENT);
    const [schoolName, setSchoolName] = useState(user.studentData?.schoolName || '');
    const [studentId, setStudentId] = useState(''); // Don't expose ID back if possible or mask it
    const [counselorEmail, setCounselorEmail] = useState(user.studentData?.counselorEmail || '');
    const [gradYear, setGradYear] = useState(user.studentData?.graduationYear?.toString() || new Date().getFullYear().toString());

    // Sync local state when user prop updates
    React.useEffect(() => {
        setIsStudentMode(user.role === UserRole.STUDENT);
        setSchoolName(user.studentData?.schoolName || '');
        setCounselorEmail(user.studentData?.counselorEmail || '');
    }, [user]);

    const handleSaveStudentMode = async () => {
        setIsThinking(true);
        try {
            const updatedUser = {
                ...user,
                role: isStudentMode ? UserRole.STUDENT : UserRole.NEIGHBOR,
                studentData: isStudentMode ? {
                    ...user.studentData!,
                    schoolId: 'manual-entry',
                    schoolName,
                    counselorEmail,
                    graduationYear: parseInt(gradYear),
                    verifiedHours: user.studentData?.verifiedHours || 0,
                    pendingHours: user.studentData?.pendingHours || 0,
                    certificates: user.studentData?.certificates || []
                } : undefined
            };
            await updateProfile(updatedUser);
            onUpdateUser(updatedUser);
            await new Promise(r => setTimeout(r, 800));
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="p-6 overflow-y-auto pb-24 h-full relative">
            {/* Mobile Logout Button */}
            <div className="md:hidden absolute top-6 right-6">
                <button onClick={onLogout} className="p-2 bg-red-50 text-red-500 rounded-full">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Profile</h2>
                <button onClick={onToggleDarkMode} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center mb-6 transition-colors">
                <img src={user.avatarUrl} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 dark:border-slate-700" />
                <h3 className="text-xl font-bold dark:text-white">{user.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {user.role === UserRole.NEIGHBOR ? 'Community Volunteer' : user.role.replace('_', ' ')}
                </p>

                {user.role !== UserRole.COUNSELOR && (
                    <>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 flex justify-between">
                            <span>Level 5</span>
                            <span>700 / 1000 XP to Level 6</span>
                        </p>
                        <button
                            onClick={() => setShowSkillTree(true)}
                            className="w-full py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 transition-colors mb-6"
                        >
                            <Zap className="w-3 h-3" /> View Career Progress (Skill Trees)
                        </button>
                    </>
                )}

                <div className="flex justify-center gap-8 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{user.trustScore}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Trust Score</p>
                    </div>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowServiceMap(true)}>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{missions.filter(m => m.status === 'VERIFIED').length}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1"><MapIcon className="w-3 h-3" /> Service Map</p>
                    </div>
                </div>
            </div>

            <ServiceMap
                isOpen={showServiceMap}
                onClose={() => setShowServiceMap(false)}
                user={user}
                allMissions={missions}
            />

            <SkillTreeModal
                isOpen={showSkillTree}
                onClose={() => setShowSkillTree(false)}
                completedMissions={missions}
            />

            {/* Student Details Form (Only for Students) */}
            {user.role === UserRole.STUDENT && (
                <div className="space-y-4 animate-fadeIn mb-6">
                    {/* School Info */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <School className="w-4 h-4 text-indigo-500" /> {user.studentData?.schoolName || 'School Name'}
                        </h4>

                        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <span>Graduating Class</span>
                            <span className="font-mono">{user.studentData?.graduationYear || 'N/A'}</span>
                        </div>

                        {/* LMS Connect Mock */}
                        <button
                            onClick={() => {
                                setIsThinking(true);
                                setTimeout(() => {
                                    setIsThinking(false);
                                    addToast('success', 'LMS Connected', 'Synced with Canvas/Blackboard successfully.');
                                }, 1500);
                            }}
                            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-dashed border-indigo-200 dark:border-indigo-800"
                        >
                            Connect to Canvas / Blackboard
                        </button>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                            <School className="w-4 h-4" /> Student Verification
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">School Name</label>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    placeholder="e.g. Lincoln High School"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Class Year</label>
                                    <input
                                        type="number"
                                        value={gradYear}
                                        onChange={(e) => setGradYear(e.target.value)}
                                        className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Student ID</label>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Counselor Email</label>
                                <input
                                    type="email"
                                    value={counselorEmail}
                                    onChange={(e) => setCounselorEmail(e.target.value)}
                                    className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    placeholder="so we can verify verify your hours"
                                />
                            </div>
                            <button
                                onClick={handleSaveStudentMode}
                                disabled={isThinking}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                {isThinking ? 'Saving...' : 'Save School Details'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {user.role !== UserRole.COUNSELOR && (
                <>
                    <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-white"><Wallet className="w-5 h-5 text-indigo-600" /> Impact Wallet</h3>
                    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Total Impact Credits</p>
                            <h2 className="text-4xl font-bold mb-4">{user.impactCredits.toLocaleString()} <span className="text-lg font-normal text-indigo-300">IC</span></h2>

                            <div className="flex gap-2">
                                <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg">Redeem</button>
                                <button className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg">History</button>
                            </div>
                        </div>
                    </div>

                    <h3 className="font-bold mb-3 dark:text-white">Badges</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {user.badges.map(b => (
                            <span key={b} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                                <Award className="w-3 h-3 text-yellow-500" /> {b}
                            </span>
                        ))}
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1 rounded-lg text-sm font-medium border border-dashed border-slate-300 dark:border-slate-600 opacity-70">
                            Pothole Patroller (Locked)
                        </span>
                        <button className="bg-violet-50 text-violet-600 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 border border-violet-100 border-dashed">
                            <Plus className="w-3 h-3" /> Earn More
                        </button>
                    </div>
                </>
            )}

            {/* Role Switcher (Moved from Sidebar) */}
            <div className="mb-6">
                <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> View As Role
                </h3>
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                    {[
                        { role: UserRole.NEIGHBOR, label: 'Volunteer', color: 'bg-emerald-500', text: 'text-emerald-400' },
                        { role: UserRole.STUDENT, label: 'Student', color: 'bg-indigo-500', text: 'text-indigo-400' },
                        { role: UserRole.COUNSELOR, label: 'Counselor', color: 'bg-orange-500', text: 'text-orange-400' }
                    ].map((opt) => (
                        <button
                            key={opt.role}
                            onClick={() => onUpdateUser({ ...user, role: opt.role })}
                            className={`w-full text-left text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-between group ${user.role === opt.role
                                ? 'bg-white dark:bg-black/20 shadow-sm border border-slate-200 dark:border-slate-700'
                                : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5'
                                }`}
                        >
                            <span className={`font-medium ${user.role === opt.role ? 'text-slate-900 dark:text-white' : ''}`}>{opt.label}</span>
                            {user.role === opt.role && (
                                <div className={`w-2 h-2 rounded-full ${opt.color} shadow-[0_0_8px_currentColor]`} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accessibility Controls */}
            <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-white">
                    <Eye className="w-5 h-5 text-indigo-500" /> Accessibility
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium dark:text-white">High Glare Mode</p>
                            <p className="text-xs text-slate-500">Max contrast for outdoors</p>
                        </div>
                        <button
                            onClick={() => onUpdateAccessibility({ ...accessibilitySettings, highContrast: !accessibilitySettings.highContrast })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${accessibilitySettings.highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${accessibilitySettings.highContrast ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium dark:text-white">Big Button Mode</p>
                            <p className="text-xs text-slate-500">Easy touch targets</p>
                        </div>
                        <button
                            onClick={() => onUpdateAccessibility({ ...accessibilitySettings, bigButtons: !accessibilitySettings.bigButtons })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${accessibilitySettings.bigButtons ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${accessibilitySettings.bigButtons ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="md:hidden mt-8">
                <button onClick={onShowHelp} className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors">
                    <HelpCircle className="w-5 h-5" /> Help & Support
                </button>
            </div>
        </div>
    );
};

export default ProfileView;
