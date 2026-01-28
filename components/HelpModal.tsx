import React, { useState } from 'react';
import { X, Map, Search, Plus, Mic, User, ShieldCheck, Heart, BookOpen, MessageCircle, Accessibility } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'FIND' | 'MISSIONS' | 'POST' | 'VOICE' | 'ACCESSIBILITY'>('OVERVIEW');

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
                Locate verified community resources like Food Banks, Shelters, and Medical Clinics nearby.
                <br /><span className="text-xs font-bold mt-1 block">Need help? Ask the Chat Assistant in the bottom right!</span>
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">1</div>
                <span><strong>Search & Filter:</strong> Use the search bar for keywords (e.g., "soup kitchen") or tap the pill buttons to filter by category.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">2</div>
                <span><strong>View Details:</strong> Tap on any resource card to see phone numbers, operating hours, and directions.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold">3</div>
                <span><strong>Map Mode:</strong> Toggle to the Map View (top right) to see resources visually relative to your location.</span>
              </li>
            </ul>
          </div>
        );
      case 'MISSIONS':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h3 className="font-bold text-orange-900 flex items-center gap-2 mb-2">
                <Map className="w-5 h-5" /> Completing Missions
              </h3>
              <p className="text-sm text-orange-700">
                Earn Impact Credits by helping your neighbors. Verified actions build your Trust Score.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600 font-bold">1</div>
                <span><strong>Browse:</strong> Look for "Open" missions on the Missions tab. Filters help you find specific types (Fixes, Food, etc.).</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600 font-bold">2</div>
                <span><strong>Accept & Do:</strong> Click a mission to view details. Go to the location and perform the help action.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600 font-bold">3</div>
                <span><strong>Verify:</strong> Upload a photo proof (before/after) to complete the mission and get your reward immediately.</span>
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
                <Accessibility className="w-5 h-5" /> Accessibility Features
              </h3>
              <p className="text-sm text-emerald-700">
                Tools designed to make Community Hero usable for everyone, everywhere.
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
      default: // OVERVIEW
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
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
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-indigo-600" /> Help Center
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">How to use Community Hero</p>
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
                <Accessibility className="w-4 h-4" /> Accessibility
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