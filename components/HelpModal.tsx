import React, { useState } from 'react';
import { X, Map, Search, Plus, Mic, User, ShieldCheck, Heart, BookOpen, MessageCircle, Accessibility, Shield, GraduationCap, Users, Radio, Palette } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'FIND' | 'MISSIONS' | 'POST' | 'VOICE' | 'PROFILE' | 'CREATIVE' | 'MESH'>('OVERVIEW');

  const renderContent = () => {
    switch (activeSection) {
      case 'FIND':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                <Search className="w-5 h-5" /> Find Help Directory
              </h3>
              <p className="text-sm text-indigo-700">
                Locate verified community resources with <strong>Live Data</strong>.
                <br />Real-time updates for Food Banks, Shelters, and Medical Clinics.
              </p>
            </div>

            {/* Phase 6: New Features Highlight */}
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900 uppercase">NEW: Hero Verified</span>
              </div>
              <p className="text-xs text-emerald-700">
                See who verified each resource and when! Look for green badges like "Alex Chen verified 2h ago"
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">1</div>
                <span><strong>Open Now Filter:</strong> Tap the "✓ Open Now" button to show only currently open resources—perfect for crisis situations!</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">2</div>
                <span><strong>Search & Filter:</strong> Use the search bar for keywords (e.g., "soup kitchen") or tap the pill buttons to filter by category.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">3</div>
                <span><strong>Hero Actions:</strong> Tap the ⋮ menu on any resource card to Mark as Open/Closed or Report Issues. Your updates help the community!</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">4</div>
                <span><strong>View Details:</strong> Tap on any resource card to see phone numbers, operating hours, and directions.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">5</div>
                <span><strong>Map Mode:</strong> Toggle to the Map View (top right) to see resources visually relative to your location.</span>
              </li>
            </ul>

            <div className="bg-slate-100 p-3 rounded-lg">
              <p className="text-xs text-slate-600">
                💡 <strong>Pro Tip:</strong> When you mark a resource as open or closed, you're earning Trust Score and helping neighbors in need!
              </p>
            </div>
          </div>
        );
      case 'MISSIONS':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
              <h3 className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-2 mb-2">
                <Map className="w-5 h-5" /> Completing Missions
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Earn Impact Credits by helping your neighbors. Verified actions build your Trust Score.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-300 font-bold">1</div>
                <span><strong>Browse & Squad Up:</strong> Find missions or form a Squad to tackle larger tasks together. Use <strong>Squad Chat</strong> to coordinate.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-300 font-bold">2</div>
                <span><strong>Smart Routing:</strong> Look for the "Efficiency Route" badge to find missions you can do on your way.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-300 font-bold">3</div>
                <span><strong>Verify:</strong> Upload before/after photos. Food rescue missions check your inventory capacity!</span>
              </li>
            </ul>
          </div>
        );
      case 'POST':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5" /> Posting Requests
              </h3>
              <p className="text-sm text-blue-700">
                Need help? Create a bounty for the community to solve.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold">1</div>
                <span><strong>Create Report:</strong> Tap the "+" button. Describe the issue (e.g., "Pothole on Main St") or need.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold">2</div>
                <span><strong>Set Bounty:</strong> (Optional) Offer Impact Credits to incentivize faster help.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 font-bold">3</div>
                <span><strong>Marathon Agent:</strong> For complex goals (e.g. "Clean River"), use the Marathon Agent to automatically break it down into small tasks.</span>
              </li>
            </ul>
          </div>
        );
      case 'VOICE':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
              <h3 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5" /> Voice Mode Assistant
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Hands-free voice interface for quick help and navigation.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="font-bold">Now Live!</span>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Tap the microphone tab to start a real-time conversation.
              </p>
              <ul className="text-xs space-y-1 opacity-80 list-disc list-inside">
                <li>Ask to find nearby missions</li>
                <li>Get help with cleanup reports</li>
                <li>Navigation assistance</li>
              </ul>
            </div>



            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Planned Features:</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 font-bold">1</div>
                  <span><strong>Voice Commands:</strong> Navigate the app hands-free with spoken instructions like "Show nearby missions" or "Read resource details"</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 font-bold">2</div>
                  <span><strong>Audio Descriptions:</strong> Hear mission details, directions, and verification status read aloud</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 font-bold">3</div>
                  <span><strong>Screen Reader Optimization:</strong> Enhanced compatibility with VoiceOver (iOS) and TalkBack (Android)</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400 font-bold">4</div>
                  <span><strong>Turn-by-Turn Audio:</strong> Voice-guided navigation to mission locations</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-500 italic mt-4">
              Tip: You can switch back to the main app anytime by saying "Go Home".
            </p>
          </div>
        );
      case 'ACCESSIBILITY':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                <Accessibility className="w-5 h-5" /> Accessibility Settings
              </h3>
              <p className="text-sm text-emerald-700">
                Tools designed to make Community Hero usable for everyone, everywhere. Find these in your <strong>Profile</strong> tab.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 text-emerald-600 font-bold">1</div>
                <span><strong>High Glare Mode:</strong> Toggle this in Profile for maximum contrast (Black/White/Yellow). Perfect for outdoor use in bright sunlight.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 text-emerald-600 font-bold">2</div>
                <span><strong>Big Button Mode:</strong> Simplifies the "Active Mission" screen (while in progress) to show only large, easy-to-tap buttons for "Complete" and "Emergency".</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 text-emerald-600 font-bold">3</div>
                <span><strong>Voice Mode:</strong> Hands-free navigation for visually impaired users.</span>
              </li>
            </ul>
          </div>
        );
      case 'SAFETY':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
              <h3 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" /> Safety & Patrol Settings
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Tools to keep you and your neighborhood safe. Configure Patrol Mode in your <strong>Profile</strong> tab.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center shrink-0 text-red-600 dark:text-red-300 font-bold">1</div>
                <span><strong>Quick Alert (SOS):</strong> Use the floating red button for instant access. Tap to Report, Long-Press for SOS.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center shrink-0 text-red-600 dark:text-red-300 font-bold">2</div>
                <span><strong>Report Incidents:</strong> File structured reports for Theft, Suspicious Activity, or Hazards with AI triage.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center shrink-0 text-red-600 dark:text-red-300 font-bold">3</div>
                <span><strong>Neighbor Patrol:</strong> Toggle "Patrol Mode" in your Profile to log safe walks and earn badges.</span>
              </li>
            </ul>
          </div>
        );
      case 'STUDENT':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5" /> Student Service Learning
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-400">
                Track volunteer hours and export official transcripts. Enable Student Mode in your <strong>Profile</strong> tab.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-300 font-bold">1</div>
                <span><strong>Student Mode:</strong> Verification toggle in Profile to unlock academic features.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-300 font-bold">2</div>
                <span><strong>Export Transcript:</strong> Generate PDF reports of your verified volunteer hours for school credit.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-300 font-bold">3</div>
                <span><strong>Counselor Connect:</strong> Teachers can review and approve hours via the Counselor Dashboard.</span>
              </li>
            </ul>
          </div>
        );

      case 'MESH':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
                <Radio className="w-5 h-5" /> Mesh Mode (Disaster Recovery)
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Production-ready <strong>offline emergency features</strong> for disaster scenarios when internet is unreliable.
              </p>
            </div>

            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">1</div>
                <span><strong>Low-Bandwidth Mode:</strong> When mesh/swarm mode is active, images are replaced with icons to save 99%+ bandwidth (~8MB → 20KB). Look for the green "🔧 Low-Bandwidth Mode Active" header.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">2</div>
                <span><strong>Mesh Verification Badges:</strong> Green pulsing badges with 📡 icon show mesh-verified data. Blue static badges (🛡️) indicate internet-sourced data.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">3</div>
                <span><strong>Local Broadcast:</strong> Tap the pulsing green FAB button (bottom-right) to send emergency broadcasts to nearby mesh nodes only. Choose from templates: Help Needed, Resource Available, Hazard Alert.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">4</div>
                <span><strong>Character Limit:</strong> Broadcasts are limited to 256 characters for bandwidth conservation. Messages stay on local mesh until internet is restored.</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">Emergency Use Only</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Mesh mode is designed for disaster scenarios. Activate swarm mode when internet connectivity is unreliable or unavailable.
              </p>
            </div>
          </div>
        );

      default: // OVERVIEW
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden border-2 border-indigo-200">
                <img src="/logo.png" alt="Community Hero" className="w-12 h-12 object-cover" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Welcome to Community Hero</h3>
              <p className="text-sm text-slate-500">The operating system for unified neighborhoods.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-xs text-slate-700 uppercase mb-1">Impact Credits</h4>
                <p className="text-[10px] text-slate-500">Your currency of good deeds. Earn by helping, spend on rewards.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-xs text-slate-700 uppercase mb-1">Trust Score</h4>
                <p className="text-[10px] text-slate-500">Verified reputation. Higher scores unlock leadership roles.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Quick Start</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                1. Go to the <strong>Find Help</strong> tab to see resources.<br />
                2. Check <strong>Missions</strong> to start earning XP.<br />
                3. Toggle <strong>Voice Mode</strong> for hands-free help.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Circular Logo */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg border-4 border-indigo-200 dark:border-indigo-800/50">
              <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Help Center
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">How to use Community Hero</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-1/3 bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 p-4 overflow-y-auto">
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('OVERVIEW')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'OVERVIEW' ? 'bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <BookOpen className="w-4 h-4" /> Overview
              </button>
              <button
                onClick={() => setActiveSection('FIND')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'FIND' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Search className="w-4 h-4" /> Find Help
              </button>
              <button
                onClick={() => setActiveSection('MISSIONS')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'MISSIONS' ? 'bg-white dark:bg-slate-800 shadow-md text-orange-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Map className="w-4 h-4" /> Missions
              </button>
              <button
                onClick={() => setActiveSection('POST')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'POST' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Plus className="w-4 h-4" /> Post & Fix
              </button>
              <button
                onClick={() => setActiveSection('VOICE')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'VOICE' ? 'bg-white dark:bg-slate-800 shadow-md text-red-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Mic className="w-4 h-4" /> Voice Mode
              </button>
              <button
                onClick={() => setActiveSection('ACCESSIBILITY')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'ACCESSIBILITY' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Accessibility className="w-4 h-4" /> Profile: Accessibility
              </button>
              <button
                onClick={() => setActiveSection('SAFETY')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'SAFETY' ? 'bg-white dark:bg-slate-800 shadow-md text-red-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Shield className="w-4 h-4" /> Profile: Safety
              </button>
              <button
                onClick={() => setActiveSection('STUDENT')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'STUDENT' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <GraduationCap className="w-4 h-4" /> Profile: Student
              </button>
              <button
                onClick={() => setActiveSection('CREATIVE')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'CREATIVE' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Palette className="w-4 h-4" /> Creative (Profile Settings)
              </button>
              <button
                onClick={() => setActiveSection('MESH')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeSection === 'MESH' ? 'bg-white dark:bg-slate-800 shadow-md text-emerald-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Radio className="w-4 h-4" /> Mesh Mode
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900 dark:text-slate-200">
            {renderContent()}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-slate-200 dark:shadow-none"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};

export default HelpModal;