import React, { useState, useEffect } from 'react';
import { CommunityResource, ResourceType } from '../types';
import { Map, Phone, Navigation, Clock, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import MapView from './MapView';
import { getResources, geocodeAddress } from '../services/placesService';
import { INITIAL_RESOURCES } from '../constants'; // Fallback

interface DirectoryViewProps {
    // resources prop is deprecated, we fetch internally now but keeping for backward compat
    resources?: CommunityResource[];
    onResourceClick?: (resource: CommunityResource) => void;
}

const DirectoryView: React.FC<DirectoryViewProps> = ({ onResourceClick }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
    const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [resources, setResources] = useState<CommunityResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Fetch user location and resources on mount
    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                // Default to NYC if location not available yet
                const defaultLocation = { lat: 40.7128, lng: -74.0060 };
                let location = defaultLocation;

                // Try to get real location
                if (navigator.geolocation) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                        });
                        location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        setUserLocation(location);
                    } catch (e) {
                        console.warn('Geolocation failed or missing permissions, using default.');
                    }
                }

                // Fetch real data
                const realResources = await getResources(location);
                setResources(realResources.length > 0 ? realResources : INITIAL_RESOURCES);
            } catch (err) {
                console.error('Failed to load resources:', err);
                setError('Failed to load local resources. Showing offline data.');
                setResources(INITIAL_RESOURCES);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Check if zip code (5 digits)
            if (/^\d{5}$/.test(searchQuery.trim())) {
                setLoading(true);
                setError(null);
                try {
                    const coords = await geocodeAddress(searchQuery.trim());
                    if (coords) {
                        setUserLocation(coords);
                        const newResources = await getResources(coords, 'zip-' + searchQuery, true); // Force refresh for new location
                        setResources(newResources); // Don't fallback to demo data for explicit searches
                    } else {
                        setError('Could not find location for that Zip Code');
                    }
                } catch (err) {
                    console.error('Zip search failed:', err);
                    setError('Failed to search location.');
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const filteredResources = resources.filter(r => {
        const matchesFilter = filterType === 'ALL' || r.type === filterType;
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            /^\d{5}$/.test(searchQuery); // Always return true for zip codes so we show the new fetched results
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            {/* Search & Filter Header */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 sticky top-0">
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search food, shelter, or Zip Code..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 shrink-0">
                        <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            <ListIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('MAP')} className={`p-2 rounded-md transition-all ${viewMode === 'MAP' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            <Map className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <FilterButton
                        active={filterType === 'ALL'}
                        onClick={() => setFilterType('ALL')}
                        label="All Resources"
                        color="indigo"
                    />
                    <FilterButton
                        active={filterType === ResourceType.FOOD_BANK}
                        onClick={() => setFilterType(ResourceType.FOOD_BANK)}
                        label="Food Banks"
                        color="green"
                    />
                    <FilterButton
                        active={filterType === ResourceType.SHELTER}
                        onClick={() => setFilterType(ResourceType.SHELTER)}
                        label="Shelters"
                        color="blue"
                    />
                    <FilterButton
                        active={filterType === ResourceType.HOSPITAL}
                        onClick={() => setFilterType(ResourceType.HOSPITAL)}
                        label="Medical"
                        color="red"
                    />
                    <FilterButton
                        active={filterType === ResourceType.PHARMACY}
                        onClick={() => setFilterType(ResourceType.PHARMACY)}
                        label="Pharmacy"
                        color="purple"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Finding nearby help...</p>
                    </div>
                ) : (
                    viewMode === 'LIST' ? (
                        <div className="overflow-y-auto h-full p-4 space-y-3 pb-24 md:pb-6">
                            {error && (
                                <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {filteredResources.map(resource => (
                                <div key={resource.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onResourceClick?.(resource)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`p-1.5 rounded-lg ${resource.type === ResourceType.HOSPITAL ? 'bg-red-100 text-red-600' :
                                                resource.type === ResourceType.FOOD_BANK ? 'bg-green-100 text-green-600' :
                                                    resource.type === ResourceType.PHARMACY ? 'bg-purple-100 text-purple-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                {getIconForType(resource.type)}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                                {resource.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md">
                                            {userLocation ?
                                                `${calculateDistance(userLocation.lat, userLocation.lng, resource.location.lat, resource.location.lng).toFixed(1)} mi` :
                                                'Nearby'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{resource.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{resource.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
                                        <button className="flex items-center gap-1 hover:text-indigo-600">
                                            <Phone className="w-3 h-3" /> {resource.contact.phone}
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-indigo-600">
                                            <Clock className="w-3 h-3" /> {resource.contact.hours}
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-indigo-600 ml-auto bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.location.lat},${resource.location.lng}`);
                                            }}
                                        >
                                            <Navigation className="w-3 h-3" /> Directions
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredResources.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p>No resources found matching your search.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full w-full relative">
                            <MapView
                                missions={[]}
                                resources={filteredResources}
                                onMissionClick={() => { }}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

// Helper Components & Functions
const FilterButton = ({ active, onClick, label, color }: any) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${active
        ? `bg-${color}-100 border-${color}-200 text-${color}-700 dark:bg-${color}-900 dark:border-${color}-700 dark:text-${color}-200`
        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
        }`}>
        {label}
    </button>
);

const ListIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
);
const UtensilsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2h.01" /><path d="M7 2h.01" /><path d="M21 21v-1.5a2.5 2.5 0 0 0-5 0v1.5a2.5 2.5 0 0 0 5 0" /><path d="m15 15 6 6" /><path d="M3 3a5 5 0 0 0 5 5v1a4 4 0 0 1-4 4v7H3v-7a4 4 0 0 1-4-4V8a5 5 0 0 0 5-5Z" /></svg>
);
const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const PillIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);

function getIconForType(type: ResourceType) {
    switch (type) {
        case ResourceType.HOSPITAL: return <ActivityIcon className="w-4 h-4" />;
        case ResourceType.FOOD_BANK: return <UtensilsIcon className="w-4 h-4" />;
        case ResourceType.PHARMACY: return <PillIcon className="w-4 h-4" />;
        default: return <HomeIcon className="w-4 h-4" />;
    }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)) * 0.621371; // 2 * R; R = 6371 km; * 0.621371 to miles
}

export default DirectoryView;
