import React, { useState } from 'react';
import { User, UserRole, Mission, HeroSpecialization, MissionStatus } from '../types';
import { Wallet, Award, Plus, Sun, Moon, LogOut, HelpCircle, School, CheckCircle, AlertTriangle, Users, Map as MapIcon, Zap, Eye, Leaf, Shield, Flame, Upload, Trophy } from 'lucide-react';
import ServiceMap from './ServiceMap';
import SkillTreeModal from './SkillTreeModal';
import TranscriptUploadModal from './TranscriptUploadModal';
import TranscriptExport from './TranscriptExport';
import LeaderboardModal from './LeaderboardModal';
import { updateProfile } from '../services/firestoreService';
import { Button, Badge, Card, ProgressBar } from './index';

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
    const [showTranscriptModal, setShowTranscriptModal] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Student Mode Form State
    const [isStudentMode, setIsStudentMode] = useState(user.role === UserRole.STUDENT);
    const [schoolName, setSchoolName] = useState(user.studentData?.schoolName || '');
    const [studentId, setStudentId] = useState(''); // Don't expose ID back if possible or mask it
    const [counselorEmail, setCounselorEmail] = useState(user.studentData?.counselorEmail || '');
    const [gradYear, setGradYear] = useState(user.studentData?.graduationYear?.toString() || new Date().getFullYear().toString());

    // Phase 6: Wallet Clarity
    const pendingCredits = missions.filter(m => m.status === MissionStatus.VERIFYING).reduce((acc, m) => acc + (m.reward || 0), 0);

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
                        <div className="mb-4">
                            <ProgressBar
                                current={700}
                                max={1000}
                                label={`Level 5 → Level 6`}
                                variant="gradient"
                                showPercentage={true}
                            />
                        </div>
                        <Button
                            onClick={() => setShowSkillTree(true)}
                            variant="secondary"
                            size="sm"
                            className="w-full mb-6"
                        >
                            <Zap className="w-3 h-3" /> View Career Progress (Skill Trees)
                        </Button>
                    </>
                )}

                <div className="flex justify-center gap-8 border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div>
                        <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">{user.trustScore}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">Trust Score</p>
                    </div>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowServiceMap(true)}>
                        <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">{missions.filter(m => m.status === 'VERIFIED').length}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Impact Heatmap</p>
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

            <TranscriptUploadModal
                isOpen={showTranscriptModal}
                onClose={() => setShowTranscriptModal(false)}
                onSyncComplete={(credits) => {
                    addToast('success', 'Credits Redeemed', `You earned + ${credits} Impact Credits from your transcript!`);
                    // In a real app, update user.impactCredits here
                }}
            />

            <LeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
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
                            onClick={() => setShowTranscriptModal(true)}
                            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors border border-dashed border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2"
                        >
                            <Upload className="w-3 h-3" /> Sync Grades & Transcript
                        </button>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <div className="flex justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <Wallet className="w-4 h-4" />
                                    <span className="font-bold">{user.impactCredits}</span> <span className="text-xs font-normal">Available</span>
                                </div>
                                {pendingCredits > 0 && (
                                    <div className="text-xs text-slate-400 animate-pulse">
                                        +{pendingCredits} Pending
                                    </div>
                                )}
                            </div>
                            {/* Phase 2: Local Perks */}
                            <button onClick={() => alert('Opening Perks Bazaar...')} className="text-xs font-bold text-indigo-600 underline">Spend</button>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                <span className="font-bold text-slate-900 dark:text-white">Level 5</span> Scout
                            </div>
                        </div>

                        {isStudentMode && (
                            <div className="mt-4 flex justify-center">
                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <School className="w-3 h-3" /> Student Mode Active
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Student Mode Toggle Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold dark:text-white flex items-center gap-2">
                        <School className="w-5 h-5 text-indigo-500" /> Student Verification
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isStudentMode} onChange={(e) => setIsStudentMode(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                {isStudentMode && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">High School</label>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
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
                                    placeholder="so we can verify verified hours"
                                />
                            </div>
                            <button
                                onClick={handleSaveStudentMode}
                                disabled={isThinking}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                {isThinking ? 'Saving...' : 'Save School Details'}
                            </button>

                            {/* Transcript Export */}
                            <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                                <TranscriptExport user={user} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

            {/* Phase 6: Social Proof / Leaderboard Teaser */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white hover:opacity-95 transition-opacity cursor-pointer mb-6" onClick={() => setShowLeaderboard(true)}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-300" /> Community Standings</h3>
                    <Badge variant="success" className="bg-white/20 text-white border-0">Top 5%</Badge>
                </div>
                <p className="text-indigo-100 text-sm mb-3">You're making a huge impact! See how you rank against other neighbors.</p>
                <div className="flex -space-x-3 items-center">
                    <img className="w-8 h-8 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/64/100/100" />
                    <img className="w-8 h-8 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/65/100/100" />
                    <img className="w-8 h-8 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/66/100/100" />
                    <div className="w-8 h-8 rounded-full bg-indigo-800 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold">+42</div>
                </div>
            </div>

            {/* Phase 5: Neighbor Patrol Toggle */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full text-red-600 dark:text-red-300">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Neighbor Patrol</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Log safe walks & earn badges</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
            </div>

            {/* Phase 2: Tangible Impact Dashboard */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Leaf className="w-24 h-24 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Trash Diverted</p>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">42 kg</p>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full w-[70%]" />
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Top 5% in Neighborhood</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                        <Users className="w-24 h-24 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Neighbors Helped</p>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-100">12</p>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full w-[45%]" />
                    </div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 font-medium">3 this week!</p>
                </div>
            </div>

            {/* Phase 2: Hero Specializations */}
            {user.role !== UserRole.COUNSELOR && (
                <div className="mb-6">
                    <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-500" /> Hero Specializations
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Mocking populated specializations if undefined for demo */}
                        {(user.specializations || [HeroSpecialization.ECO_WARRIOR]).map(spec => (
                            <div key={spec} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
                                    <Zap className="w-4 h-4 fill-current" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-tight">{spec.replace('_', ' ')}</p>
                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Level 3 • 1,200 XP</p>
                                </div>
                            </div>
                        ))}
                        <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3 flex flex-col items-center justify-center text-slate-400 gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span className="text-xs font-bold">Add Track</span>
                        </div>
                    </div>
                </div>
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
                            className={`w - full text - left text - xs py - 2 px - 3 rounded - xl transition - all flex items - center justify - between group ${user.role === opt.role
                                ? 'bg-white dark:bg-black/20 shadow-sm border border-slate-200 dark:border-slate-700'
                                : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5'
                                } `}
                        >
                            <span className={`font - medium ${user.role === opt.role ? 'text-slate-900 dark:text-white' : ''} `}>{opt.label}</span>
                            {user.role === opt.role && (
                                <div className={`w - 2 h - 2 rounded - full ${opt.color} shadow - [0_0_8px_currentColor]`} />
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
                            className={`w - 12 h - 6 rounded - full transition - colors relative ${accessibilitySettings.highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} `}
                        >
                            <div className={`w - 4 h - 4 bg - white rounded - full absolute top - 1 transition - all shadow - sm ${accessibilitySettings.highContrast ? 'left-7' : 'left-1'} `} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium dark:text-white">Big Button Mode</p>
                            <p className="text-xs text-slate-500">Easy touch targets</p>
                        </div>
                        <button
                            onClick={() => onUpdateAccessibility({ ...accessibilitySettings, bigButtons: !accessibilitySettings.bigButtons })}
                            className={`w - 12 h - 6 rounded - full transition - colors relative ${accessibilitySettings.bigButtons ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'} `}
                        >
                            <div className={`w - 4 h - 4 bg - white rounded - full absolute top - 1 transition - all shadow - sm ${accessibilitySettings.bigButtons ? 'left-7' : 'left-1'} `} />
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
