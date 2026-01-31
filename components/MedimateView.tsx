import React, { useState } from 'react';
import { Heart, Activity, Pill, Droplet, Plus, Filter, Navigation, Phone, ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { Mission, MissionType, MissionStatus, BloodType, User } from '../types';

// Mock Data: Blood Requests (Urgent Needs)
const BLOOD_REQUESTS: Mission[] = [
    {
        id: 'med-1',
        type: MissionType.MEDICAL_NEED,
        title: 'Urgent: O+ Blood Needed',
        description: 'Patient undergoing surgery at City Hospital. Family donor unavailable.',
        location: 'City Hospital, Downtown',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        distance: '0.8 mi',
        reward: 500,
        status: MissionStatus.OPEN,
        urgency: 'HIGH',
        timeEstimate: '1 hr',
        medicalData: {
            bloodType: BloodType.O_POS,
            isUrgentTransport: false,
            condition: 'Surgery Requirement'
        }
    },
    {
        id: 'med-2',
        type: MissionType.MEDICAL_NEED,
        title: 'B- Donor for Rare Group',
        description: 'Thalassemia patient needs regular transfusion support.',
        location: 'Community Health Center',
        coordinates: { lat: 40.7150, lng: -74.0090 },
        distance: '1.2 mi',
        reward: 350,
        status: MissionStatus.OPEN,
        urgency: 'MEDIUM',
        timeEstimate: '45 mins',
        medicalData: {
            bloodType: BloodType.B_NEG,
            condition: 'Transfusion Support'
        }
    }
];

// Mock Data: Medicine Exchange (P2P)
const MEDICINE_OFFERS: Mission[] = [
    {
        id: 'med-3',
        type: MissionType.MEDICAL_NEED,
        title: 'Unused Insulin Pens (Levemir)',
        description: 'Box of 5 pens, sealed and refrigerated. Expiry: 12/2026. My prescription changed.',
        location: 'Westside Pharmacy Meetup',
        coordinates: { lat: 40.7200, lng: -74.0100 },
        distance: '0.5 mi',
        reward: 100,
        status: MissionStatus.OPEN,
        urgency: 'LOW',
        timeEstimate: '15 mins',
        medicalData: {
            medication: 'Insulin Levemir',
            condition: 'Diabetes'
        }
    },
    {
        id: 'med-4',
        type: MissionType.MEDICAL_NEED,
        title: 'Amoxicillin (Unopened)',
        description: 'Full course, sealed blister pack. Doctor prescribed but not used.',
        location: 'Community Center',
        coordinates: { lat: 40.7180, lng: -74.0020 },
        distance: '0.3 mi',
        reward: 50,
        status: MissionStatus.OPEN,
        urgency: 'LOW',
        timeEstimate: '10 mins',
        medicalData: {
            medication: 'Amoxicillin 500mg',
            condition: 'Antibiotic'
        }
    }
];

interface MedimateViewProps {
    user: User;
    onConnect?: (mission: Mission) => void;
}

const MedimateView: React.FC<MedimateViewProps> = ({ user, onConnect }) => {
    const [activeTab, setActiveTab] = useState<'BLOOD' | 'MEDICINE'>('BLOOD');
    const [filterBlood, setFilterBlood] = useState<BloodType | 'ALL'>('ALL');
    const [searchMed, setSearchMed] = useState('');

    const filteredBlood = BLOOD_REQUESTS.filter(m =>
        filterBlood === 'ALL' || m.medicalData?.bloodType === filterBlood
    );

    const filteredMeds = MEDICINE_OFFERS.filter(m =>
        m.title.toLowerCase().includes(searchMed.toLowerCase()) ||
        m.medicalData?.medication?.toLowerCase().includes(searchMed.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            {/* Header */}
            <div className="bg-red-600 dark:bg-red-900 text-white p-6 shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8 text-white/90" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Medimate Lane</h1>
                        <p className="text-red-100 text-xs">P2P Blood & Medicine Exchange</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setActiveTab('BLOOD')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BLOOD' ? 'bg-white text-red-600 shadow-lg' : 'bg-red-700/50 text-red-100 hover:bg-red-700'}`}
                    >
                        <Droplet className="w-4 h-4" /> Blood Match
                    </button>
                    <button
                        onClick={() => setActiveTab('MEDICINE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'MEDICINE' ? 'bg-white text-red-600 shadow-lg' : 'bg-red-700/50 text-red-100 hover:bg-red-700'}`}
                    >
                        <Pill className="w-4 h-4" /> Medicine Exchange
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 md:pb-6">

                {/* Safety Warning */}
                <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex gap-3 text-orange-800 dark:text-orange-200">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <strong className="block mb-1">Safety & Compliance Notice</strong>
                        This is a community exchange demonstrator. In a real scenario, all prescription exchanges must verify IDs and prescriptions. Blood donations are coordinated with verified centers.
                    </div>
                </div>

                {activeTab === 'BLOOD' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <button onClick={() => setFilterBlood('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${filterBlood === 'ALL' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-500'}`}>All Types</button>
                            {Object.values(BloodType).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterBlood(type)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${filterBlood === type ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        {filteredBlood.map(request => (
                            <div key={request.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Droplet className="w-3 h-3 fill-current" /> {request.medicalData?.bloodType} Donors Needed
                                    </div>
                                    <span className="text-xs font-bold text-red-500">{request.urgency} URGENCY</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{request.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{request.description}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {request.distance} away</span>
                                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Verified Case</span>
                                </div>

                                <button
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                    onClick={() => onConnect?.(request)}
                                >
                                    <Heart className="w-4 h-4 fill-current" /> I Can Donate
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'MEDICINE' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search available medicines (e.g. Insulin)..."
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                                value={searchMed}
                                onChange={(e) => setSearchMed(e.target.value)}
                            />
                        </div>

                        {/* List */}
                        {filteredMeds.map(offer => (
                            <div key={offer.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Pill className="w-3 h-3" /> Available for Pickup
                                    </div>
                                    <span className="text-xs text-slate-400">{offer.distance} away</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{offer.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{offer.description}</p>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 font-mono">
                                        Rx: {offer.medicalData?.medication}
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:border-red-500 hover:text-red-500 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                                    onClick={() => onConnect?.(offer)}
                                >
                                    Request Medicine
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Create Button */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <button
                    className="bg-red-600 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                    onClick={() => onConnect?.({ ...BLOOD_REQUESTS[0], id: 'new' })} // Placeholder for create
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
export default MedimateView;
