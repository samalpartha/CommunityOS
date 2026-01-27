import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported
import { Mission, MissionType, CommunityResource, ResourceType } from '../types';
import { MOCK_GEO_COORDS } from '../constants';
import { Activity, Layers, Navigation } from 'lucide-react';

interface MapViewProps {
    missions: Mission[];
    resources: CommunityResource[];
    onMissionClick: (mission: Mission) => void;
}

const MapView: React.FC<MapViewProps> = ({ missions, resources, onMissionClick }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showPulse, setShowPulse] = useState(false);
    const [showResources, setShowResources] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return; // Prevent double init

        try {
            const map = L.map(containerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([MOCK_GEO_COORDS.latitude, MOCK_GEO_COORDS.longitude], 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            mapRef.current = map;

            // Cleanup
            return () => {
                map.remove();
                mapRef.current = null;
            };
        } catch (err) {
            console.error("Map Init Error:", err);
        }
    }, []); // Empty dependency array -> Mount once

    // Markers Effect
    useEffect(() => {
        if (!mapRef.current) return;

        // Safety check
        const map = mapRef.current;

        // Clear existing markers (except user & circle layers)
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                // Keep user marker if possible, but easier to just clear all non-user
                // We'll just clear all and re-add user? No.
                // Let's rely on adding new ones.
                // Simplest: clear all markers that are NOT the user marker.
                // But we didn't save user marker ref.
                // So let's just clear ALL markers for now and re-add User marker + Missions.
                // Or better: Use a LayerGroup for missions.
            }
        });

        // Create a LayerGroup for missions if not exists
        // Actually, let's just use the direct adding methodology but be careful.

        const missionLayer = L.layerGroup().addTo(map);

        // Render Missions
        missions.forEach(mission => {
            if (!mission.coordinates) return;

            let colorClass = 'bg-slate-500';
            switch (mission.type) {
                case MissionType.FIX_BOUNTY: colorClass = 'bg-yellow-500'; break;
                case MissionType.FOOD_FIT: colorClass = 'bg-orange-500'; break;
                case MissionType.LONELY_MINUTES: colorClass = 'bg-blue-500'; break;
                case MissionType.LIFE_SKILL: colorClass = 'bg-emerald-500'; break;
                case MissionType.MEDICAL_NEED: colorClass = 'bg-red-500'; break;
            }

            const customIcon = L.divIcon({
                className: 'mission-marker',
                html: `<div class="w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform">!</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], { icon: customIcon })
                .bindPopup(`
                <div class="font-sans text-center">
                    <h3 class="font-bold text-sm mb-1">${mission.title}</h3>
                    <p class="text-xs text-slate-500 mb-2">${mission.timeEstimate}</p>
                </div>
            `);

            marker.on('click', () => onMissionClick(mission));
            missionLayer.addLayer(marker);
        });

        return () => {
            missionLayer.remove();
        };

    }, [missions, onMissionClick]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full bg-slate-100 z-0" />
            <div className="absolute bottom-6 left-6 z-[600] pointer-events-none">
                <div className="bg-white/80 backdrop-blur p-2 rounded-lg pointer-events-auto">
                    <p className="text-xs font-bold">Map Debug Mode</p>
                </div>
            </div>
        </div>
    );
};

export default MapView;