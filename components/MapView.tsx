import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mission, MissionType, CommunityResource, ResourceType, ActiveUser, UserRole } from '../types';
import { MOCK_GEO_COORDS } from '../constants';

interface MapViewProps {
    missions: Mission[];
    resources: CommunityResource[];
    activeUsers?: ActiveUser[];
    isSwarmActive?: boolean;
    onMissionClick: (mission: Mission) => void;
}

const MapView: React.FC<MapViewProps> = ({ missions, resources, activeUsers = [], isSwarmActive = false, onMissionClick }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter Logic for Swarm Mode
    const displayMissions = isSwarmActive
        ? missions.filter(m => m.urgency === 'HIGH')
        : missions;

    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return;

        try {
            const map = L.map(containerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([MOCK_GEO_COORDS.latitude, MOCK_GEO_COORDS.longitude], 15);

            // Base Layer
            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            // Store ref for potential updates
            mapRef.current = map;

            return () => {
                map.remove();
                mapRef.current = null;
            };
        } catch (err) {
            console.error("Map Init Error:", err);
        }
    }, []);

    // Effect: Handle Swarm Mode Visuals (Tile Layer Filters)
    useEffect(() => {
        if (!mapRef.current || !containerRef.current) return;
        const mapContainer = containerRef.current;

        if (isSwarmActive) {
            mapContainer.classList.add('map-swarm-mode');
            // We can also switch tiles here if we had a dark mode tile URL
        } else {
            mapContainer.classList.remove('map-swarm-mode');
        }
    }, [isSwarmActive]);

    // Effect: Render Markers (Missions + Bots)
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        const markersLayer = L.layerGroup().addTo(map);

        // 1. Render Missions
        displayMissions.forEach(mission => {
            if (!mission.coordinates) return;

            let colorClass = 'bg-slate-500';
            // In Swarm Mode, non-urgent missions might be dimmed/hidden, but we filtered them already
            if (isSwarmActive) {
                colorClass = 'bg-red-600 animate-pulse-ring';
                // We'll add the ring via CSS
            } else {
                switch (mission.type) {
                    case MissionType.FIX_BOUNTY: colorClass = 'bg-yellow-500'; break;
                    case MissionType.FOOD_FIT: colorClass = 'bg-orange-500'; break;
                    case MissionType.LONELY_MINUTES: colorClass = 'bg-blue-500'; break;
                    case MissionType.LIFE_SKILL: colorClass = 'bg-emerald-500'; break;
                    case MissionType.MEDICAL_NEED: colorClass = 'bg-red-500'; break;
                    case MissionType.SAFETY_PATROL: colorClass = 'bg-indigo-600'; break;
                    case MissionType.ENVIRONMENTAL: colorClass = 'bg-green-600'; break;
                }
            }

            const customIcon = L.divIcon({
                className: 'mission-marker',
                html: `<div class="w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform z-10 relative">
                        ${isSwarmActive ? '!' : '✓'}
                        ${isSwarmActive ? '<div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>' : ''}
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], { icon: customIcon })
                .bindPopup(`<div class="font-sans text-center text-slate-800"><h3 class="font-bold text-sm">${mission.title}</h3></div>`);

            marker.on('click', () => onMissionClick(mission));
            markersLayer.addLayer(marker);
        });

        // 2. Render Active Users (Live Ops)
        if (isSwarmActive || activeUsers.length > 0) {
            activeUsers.forEach(user => {
                const isResponder = user.status === 'RESPONDING';
                const userColor = isResponder ? 'bg-cyan-500' : 'bg-slate-400';

                const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: `
                        <div class="relative w-4 h-4">
                            <div class="absolute inset-0 ${userColor} rounded-full ${isResponder ? 'animate-pulse-dot box-shadow-cyan' : ''}"></div>
                            ${isResponder ? '<div class="absolute -inset-4 border border-cyan-500/30 rounded-full animate-pulse-ring"></div>' : ''}
                        </div>
                    `,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                markersLayer.addLayer(L.marker([user.location.lat, user.location.lng], { icon: userIcon }));
            });
        }

        return () => {
            markersLayer.remove();
        };

    }, [displayMissions, activeUsers, isSwarmActive, onMissionClick]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className={`w-full h-full bg-slate-100 z-0 transition-all duration-500 ${isSwarmActive ? 'grayscale contrast-125 sepia-50' : ''}`} />

            {/* Tactical Grid Overlay (Only in Swarm Mode) */}
            {isSwarmActive && (
                <div className="absolute inset-0 pointer-events-none z-[500] opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')] mix-blend-overlay"></div>
            )}
        </div>
    );
};

export default MapView;