import React, { useState, useEffect } from 'react';
import { CommunityResource, ResourceType } from '../types';
import { Map, Phone, Navigation, Clock, Search, Filter, Loader2, AlertCircle, ShieldCheck, Radio, Building2, Pill, Home, UtensilsCrossed } from 'lucide-react';
import MapView from './MapView';
import { searchNearbyPlaces, geocodeAddress } from '../services/placesService';
import { INITIAL_RESOURCES } from '../constants'; // Fallback
import { ResourceActionMenu } from './ResourceActionMenu';

interface DirectoryViewProps {
    // resources prop is deprecated, we fetch internally now but keeping for backward compat
    resources?: CommunityResource[];
    onSelectResource?: (resource: CommunityResource) => void;
    // Phase 7: Mesh Mode
    meshMode?: boolean;
    meshSignalStrength?: number;
}

const DirectoryView: React.FC<DirectoryViewProps> = ({ onSelectResource, meshMode = false, meshSignalStrength = 75 }) => {
    const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
    const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOpenOnly, setShowOpenOnly] = useState(false); // Phase 6: Open Now filter
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
                const realResources = await searchNearbyPlaces(location);

                // Helper function to map Google Places types to our ResourceType enum
                const mapPlaceTypeToResourceType = (types: string[] = []): ResourceType => {
                    // Check each type in order of specificity
                    for (const type of types) {
                        const lowerType = type.toLowerCase();

                        // Medical/Health
                        if (lowerType.includes('hospital') || lowerType.includes('doctor') || lowerType.includes('health')) {
                            return ResourceType.HOSPITAL;
                        }

                        // Pharmacy
                        if (lowerType.includes('pharmacy') || lowerType.includes('drugstore')) {
                            return ResourceType.PHARMACY;
                        }

                        // Shelter
                        if (lowerType.includes('lodging') || lowerType.includes('homeless_shelter') ||
                            lowerType.includes('shelter') || lowerType.includes('housing')) {
                            return ResourceType.SHELTER;
                        }

                        // Food Bank
                        if (lowerType.includes('food') || lowerType.includes('meal') ||
                            lowerType.includes('restaurant') || lowerType.includes('grocery')) {
                            return ResourceType.FOOD_BANK;
                        }
                    }

                    // Default fallback
                    return ResourceType.COMMUNITY_CENTER;
                };

                // Transform PlaceResult -> CommunityResource
                const mappedResources: CommunityResource[] = realResources.map((place, index) => ({
                    id: place.place_id,
                    name: place.name,
                    type: mapPlaceTypeToResourceType(place.types),
                    description: place.vicinity || 'No description available', // Fallback for description
                    location: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                        address: place.vicinity || 'Address unavailable'
                    },
                    contact: {
                        phone: 'N/A', // Places API details request needed for phone, using placeholder
                        hours: place.opening_hours?.open_now ? 'Open Now' : 'Closed'
                    },
                    services: place.types || [],
                    verified: true,
                    lastUpdated: new Date(),
                    // Phase 6: Mock hero verification for demo (every 3rd resource)
                    isOpen: place.opening_hours?.open_now ?? (index % 2 === 0),
                    ...(index % 3 === 0 && {
                        lastStatusUpdate: {
                            timestamp: new Date(Date.now() - (index * 1000 * 60 * 30)), // 30 min intervals
                            heroName: ['Alex Chen', 'Maria Rodriguez', 'Jordan Kim'][index % 3],
                            heroTrustScore: [95, 88, 92][index % 3]
                        }
                    })
                }));

                setResources(mappedResources.length > 0 ? mappedResources : INITIAL_RESOURCES);
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
                        const newResources = await searchNearbyPlaces(coords); // Force refresh for new location
                        setResources(newResources as any); // Don't fallback to demo data for explicit searches
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

    // Phase 6: Hero Action Handlers
    const handleReportIssue = (resourceId: string) => {
        // TODO: Implement report issue modal/service
        alert(`Report issue for resource: ${resourceId}`);
        console.log('Report issue for:', resourceId);
    };

    const handleUpdateStatus = (resourceId: string, isOpen: boolean) => {
        // Update resource status locally (optimistic update)
        setResources(prev => prev.map(r =>
            r.id === resourceId
                ? {
                    ...r,
                    isOpen,
                    lastStatusUpdate: {
                        timestamp: new Date(),
                        heroName: 'You', // Replace with actual user name
                        heroTrustScore: 85 // Replace with actual trust score
                    }
                }
                : r
        ));

        // TODO: Sync to backend/Firestore
        console.log(`Updated status for ${resourceId}:`, isOpen ? 'OPEN' : 'CLOSED');
    };

    const filteredResources = resources.filter(r => {
        const matchesFilter = filterType === 'ALL' || r.type === filterType;
        const matchesStatus = !showOpenOnly || r.isOpen; // Phase 6: Filter by open status
        const nameMatch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const isZipSearch = /^\d{5}$/.test(searchQuery);

        return matchesFilter && matchesStatus && (nameMatch || descMatch || isZipSearch);
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            {/* Phase 7: Low-Bandwidth Mode Indicator */}
            {meshMode && (
                <div className="bg-gradient-to-r from-emerald-500 to-green-400 px-4 py-2 flex items-center justify-between text-white text-sm font-bold shadow-sm">
                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>🔧 Low-Bandwidth Mode Active</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        Signal: {meshSignalStrength}%
                    </span>
                </div>
            )}

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
                    {/* Phase 6: Open Now Filter */}
                    <button
                        onClick={() => setShowOpenOnly(!showOpenOnly)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ml-2 ${showOpenOnly
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-700 dark:text-emerald-200 shadow-sm'
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                    >
                        {showOpenOnly ? '✓ Open Now' : 'Show All'}
                    </button>
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
                        <div className="overflow-y-auto h-full p-4 space-y-4 pb-24 md:pb-6">
                            {error && (
                                <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* RICH PLACE CARDS */}
                            {filteredResources.map((resource: any) => (
                                <div key={resource.place_id || resource.id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer group"
                                    onClick={() => onSelectResource?.(resource)}
                                >
                                    {/* Hero Image Section */}
                                    <div className="h-32 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                                        {meshMode ? (
                                            // Phase 7: Bandwidth-optimized - Replace images with resource type icons
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                                {resource.type === ResourceType.PHARMACY && <Pill className="w-16 h-16 text-purple-500" />}
                                                {resource.type === ResourceType.HOSPITAL && <Building2 className="w-16 h-16 text-red-500" />}
                                                {resource.type === ResourceType.SHELTER && <Home className="w-16 h-16 text-blue-500" />}
                                                {resource.type === ResourceType.FOOD_BANK && <UtensilsCrossed className="w-16 h-16 text-green-500" />}
                                                {resource.type === ResourceType.COMMUNITY_CENTER && <Building2 className="w-16 h-16 text-indigo-500" />}
                                            </div>
                                        ) : (
                                            <>
                                                <img
                                                    src={resource.mock_image || "https://images.unsplash.com/photo-1464699908137-9c0d4a4e1e91?auto=format&fit=crop&q=80&w=800"}
                                                    alt=""
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            </>
                                        )}

                                        {/* Phase 6: Hero Verification Badge */}
                                        {resource.lastStatusUpdate?.heroName && (
                                            <div className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1 shadow-sm ${resource.lastStatusUpdate.isMeshVerified
                                                    ? 'bg-emerald-500/90 animate-pulse'
                                                    : 'bg-blue-500/90'
                                                }`}>
                                                {resource.lastStatusUpdate.isMeshVerified ? (
                                                    <Radio className="w-3 h-3" />
                                                ) : (
                                                    <ShieldCheck className="w-3 h-3" />
                                                )}
                                                {resource.lastStatusUpdate.heroName} verified {getTimeAgo(resource.lastStatusUpdate.timestamp)}
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                            <div>
                                                <h3 className="text-white font-bold text-lg leading-tight shadow-sm">{resource.name}</h3>
                                                <div className="flex items-center gap-1 text-white/90 text-xs mt-1">
                                                    <StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold">{resource.rating || 4.5}</span>
                                                    <span className="opacity-75">({resource.user_ratings_total || 100}+ reviews)</span>
                                                </div>
                                            </div>
                                            {resource.opening_hours?.open_now ? (
                                                <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm animate-pulse">
                                                    OPEN NOW
                                                </span>
                                            ) : (
                                                <span className="bg-slate-900/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                    CLOSED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 flex-1">
                                                {resource.vicinity || resource.location?.address}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded whitespace-nowrap">
                                                    {userLocation && (resource.geometry || resource.location) ?
                                                        `${calculateDistance(
                                                            userLocation.lat,
                                                            userLocation.lng,
                                                            resource.geometry?.location?.lat || resource.location.lat,
                                                            resource.geometry?.location?.lng || resource.location.lng
                                                        ).toFixed(1)} mi`
                                                        : 'Nearby'}
                                                </span>
                                                {/* Phase 6: Hero Action Menu */}
                                                <ResourceActionMenu
                                                    resource={resource}
                                                    onReportIssue={handleReportIssue}
                                                    onUpdateStatus={handleUpdateStatus}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                                <Phone className="w-3 h-3" /> Call
                                            </button>
                                            <button
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.name)}`);
                                                }}
                                            >
                                                <Navigation className="w-3 h-3" /> Directions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredResources.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No places found matching your search.</p>
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
const StarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

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

// Phase 6: Helper to format relative time for hero verifications
function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default DirectoryView;
