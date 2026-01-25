import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Mission, MissionType, CommunityResource, ResourceType } from '../types';
import { MOCK_GEO_COORDS } from '../constants';
import { Activity, Layers } from 'lucide-react';

interface MapViewProps {
  missions: Mission[];
  resources: CommunityResource[]; // Added resources prop
  onMissionClick: (mission: Mission) => void;
}

const MapView: React.FC<MapViewProps> = ({ missions, resources, onMissionClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseLayerRef = useRef<L.LayerGroup | null>(null);
  const [showPulse, setShowPulse] = useState(false);
  const [showResources, setShowResources] = useState(true); // Toggle for Concept 1 & 6

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize Map
    mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([MOCK_GEO_COORDS.latitude, MOCK_GEO_COORDS.longitude], 15);

    // Add Tile Layer (CartoDB Positron for clean look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

    // Add User Location Pulse
    const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
                 <div class="absolute -inset-2 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
               </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
    L.marker([MOCK_GEO_COORDS.latitude, MOCK_GEO_COORDS.longitude], { icon: userIcon }).addTo(mapRef.current);

    // Initialize Pulse Layer Group
    pulseLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
        mapRef.current?.remove();
        mapRef.current = null;
    };
  }, []);

  // Update Markers when missions or resources change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers (except user & pulse layer)
    mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker && (layer.options.icon?.options.className !== 'user-marker')) {
            layer.remove();
        }
    });

    // Render Missions
    missions.forEach(mission => {
        if (!mission.coordinates) return;

        let colorClass = 'bg-slate-500';
        switch(mission.type) {
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
            .addTo(mapRef.current!)
            .bindPopup(`
                <div class="font-sans text-center">
                    <h3 class="font-bold text-sm mb-1">${mission.title}</h3>
                    <p class="text-xs text-slate-500 mb-2">${mission.timeEstimate}</p>
                </div>
            `);
        
        marker.on('click', () => onMissionClick(mission));
    });

    // Render Resources (Concept 1 & 6)
    if (showResources) {
        resources.forEach(res => {
             let iconHtml = '';
             let colorClass = 'bg-slate-700';

             if (res.type === ResourceType.HOSPITAL) {
                 colorClass = 'bg-red-600';
                 iconHtml = 'H';
             } else if (res.type === ResourceType.FOOD_BANK) {
                 colorClass = 'bg-orange-600';
                 iconHtml = 'F';
             } else if (res.type === ResourceType.SHELTER) {
                 colorClass = 'bg-indigo-600';
                 iconHtml = 'S';
             }

             const resIcon = L.divIcon({
                className: 'resource-marker',
                html: `<div class="w-6 h-6 ${colorClass} rounded-md border border-white shadow-sm flex items-center justify-center text-white font-bold text-[10px]">${iconHtml}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
             });

             L.marker([res.coordinates.lat, res.coordinates.lng], { icon: resIcon })
                .addTo(mapRef.current!)
                .bindPopup(`
                    <div class="font-sans p-1">
                        <h3 class="font-bold text-xs mb-1 text-slate-900">${res.name}</h3>
                        <p class="text-[10px] text-slate-500 mb-1">${res.description}</p>
                        <p class="text-[10px] font-bold text-indigo-600">📞 ${res.contact}</p>
                    </div>
                `);
        });
    }

  }, [missions, resources, onMissionClick, showResources]);

  // Concept 8: City Pulse Layer
  useEffect(() => {
      if (!pulseLayerRef.current) return;
      pulseLayerRef.current.clearLayers();

      if (showPulse) {
          const points = [
              { lat: MOCK_GEO_COORDS.latitude + 0.002, lng: MOCK_GEO_COORDS.longitude + 0.002, color: '#ef4444', radius: 40 }, 
              { lat: MOCK_GEO_COORDS.latitude - 0.001, lng: MOCK_GEO_COORDS.longitude - 0.002, color: '#eab308', radius: 30 },
          ];
          points.forEach(p => {
              L.circle([p.lat, p.lng], {
                  color: 'transparent',
                  fillColor: p.color,
                  fillOpacity: 0.3,
                  radius: p.radius
              }).addTo(pulseLayerRef.current!);
          });
      }
  }, [showPulse]);

  return (
    <div className="relative w-full h-full">
        <div ref={containerRef} className="w-full h-full bg-slate-100 z-0" />
        
        {/* Concept 8: Pulse Toggle */}
        <div className="absolute bottom-6 left-6 z-[600] flex flex-col gap-2">
             <button 
                onClick={() => setShowPulse(!showPulse)}
                className={`px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-xs transition-all ${showPulse ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            >
                <Activity className="w-4 h-4" /> {showPulse ? 'City Pulse: ON' : 'Show City Pulse'}
            </button>
             <button 
                onClick={() => setShowResources(!showResources)}
                className={`px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-xs transition-all ${showResources ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
            >
                <Layers className="w-4 h-4" /> {showResources ? 'Resources: ON' : 'Show Resources'}
            </button>
        </div>
    </div>
  );
};

export default MapView;