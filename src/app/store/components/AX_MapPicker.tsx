'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, X, Search } from 'lucide-react';

interface AX_MapPickerProps {
    onSelect: (data: { lat: number; lng: number; address: string; city: string; district: string }) => void;
    onClose: () => void;
    initialLat?: number;
    initialLng?: number;
}

export default function AX_MapPicker({ onSelect, onClose, initialLat = 30.0444, initialLng = 31.2357 }: AX_MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const initializedRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const [selectedAddr, setSelectedAddr] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const cssId = 'leaflet-css';
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const styleId = 'leaflet-overrides';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .leaflet-control-zoom a {
                    background: rgba(0,0,0,0.7) !important;
                    border: 1px solid rgba(255,255,255,0.15) !important;
                    color: #fff !important;
                    backdrop-filter: blur(8px);
                    width: 34px !important;
                    height: 34px !important;
                    line-height: 34px !important;
                    font-size: 18px !important;
                }
                .leaflet-control-zoom a:hover {
                    background: rgba(245,158,11,0.8) !important;
                    color: #000 !important;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.4) !important;
                }
                .leaflet-bar { border: none !important; }
                .leaflet-control-attribution {
                    background: rgba(0,0,0,0.45) !important;
                    backdrop-filter: blur(4px);
                    border-radius: 6px 0 0 0 !important;
                    color: #888 !important;
                    font-size: 9px !important;
                }
                .leaflet-control-attribution a { color: #aaa !important; }
            `;
            document.head.appendChild(style);
        }

        const loadLeaflet = () => {
            if ((window as any).L) {
                initMap();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => initMap();
            document.body.appendChild(script);
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const reverseGeocode = async (lat: number, lng: number) => {
        setResolving(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
                { headers: { 'User-Agent': 'ElKenzStore/1.0' } }
            );
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.county || addr.state || '';
            const district = addr.suburb || addr.neighbourhood || addr.quarter || '';
            const street = addr.road || addr.pedestrian || '';
            const full = [street, district, city].filter(Boolean).join('، ');
            setSelectedAddr(full || data.display_name || '');
            setSelectedCity(city);
            setSelectedDistrict(district);
        } catch {
            setSelectedAddr(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setResolving(false);
        }
    };

    const placeMarker = (map: any, lat: number, lng: number) => {
        const L = (window as any).L;
        if (markerRef.current) markerRef.current.remove();

        const icon = L.divIcon({
            html: `
                <div style="
                    position:relative;
                    width:36px;
                    height:44px;
                ">
                    <div style="
                        width:36px;height:36px;
                        background:linear-gradient(135deg,#f59e0b,#d97706);
                        border-radius:50% 50% 50% 0;
                        transform:rotate(-45deg);
                        border:3px solid white;
                        box-shadow:0 4px 16px rgba(245,158,11,0.6),0 2px 6px rgba(0,0,0,0.4);
                    "></div>
                    <div style="
                        position:absolute;
                        top:8px;left:8px;
                        width:16px;height:16px;
                        background:white;
                        border-radius:50%;
                        transform:rotate(45deg);
                    "></div>
                </div>
            `,
            iconSize: [36, 44],
            iconAnchor: [18, 44],
            className: ''
        });

        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            setCoords({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lat, pos.lng);
        });

        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
    };

    const initMap = () => {
        if (!mapRef.current) return;
        const L = (window as any).L;

        if ((mapRef.current as any)._leaflet_id) {
            (mapRef.current as any)._leaflet_id = null;
        }

        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: true,
        }).setView([initialLat, initialLng], 14);

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 19, attribution: '© Esri © Maxar © Earthstar' }
        ).addTo(map);

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 19, opacity: 0.8 }
        ).addTo(map);

        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        map.on('click', (e: any) => {
            placeMarker(map, e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        setLoading(false);

        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 16);
                placeMarker(map, latitude, longitude);
            },
            () => { },
            { timeout: 8000 }
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=ar`,
                { headers: { 'User-Agent': 'ElKenzStore/1.0' } }
            );
            const data = await res.json();
            if (data[0]) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                mapInstanceRef.current?.setView([lat, lng], 17);
                placeMarker(mapInstanceRef.current, lat, lng);
            }
        } catch { }
        finally { setSearching(false); }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ height: '88vh', maxHeight: '700px' }}>

                <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/90 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-black">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white">حدد موقعك على الخريطة</h3>
                            <p className="text-[9px] text-zinc-500 font-bold">اضغط على أي نقطة أو اسحب الـ pin للتعديل</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-4 py-2.5 border-b border-zinc-800/50 flex gap-2 shrink-0 bg-zinc-950/90">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="ابحث: شارع أو منطقة أو مدينة..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                        {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        {searching ? '' : 'بحث'}
                    </button>
                </div>

                <div className="flex-1 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-10 gap-3">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            <p className="text-zinc-500 text-xs font-bold">جاري تحميل الخريطة...</p>
                        </div>
                    )}
                    <div ref={mapRef} className="w-full h-full" />
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md shrink-0">
                    {coords ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-2.5 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
                                <MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    {resolving ? (
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <Loader2 size={12} className="animate-spin" />
                                            جاري تحديد العنوان...
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white font-bold leading-relaxed">{selectedAddr || 'اضغط على الخريطة'}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (coords && selectedAddr && !resolving) {
                                        onSelect({ lat: coords.lat, lng: coords.lng, address: selectedAddr, city: selectedCity, district: selectedDistrict });
                                        onClose();
                                    }
                                }}
                                disabled={resolving || !selectedAddr}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                <CheckIcon />
                                تأكيد هذا الموقع
                            </button>
                        </div>
                    ) : (
                        <div className="py-3 flex items-center justify-center gap-2 text-zinc-600 text-xs font-bold">
                            <MapPin size={14} />
                            اضغط على الخريطة لتحديد موقعك
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
