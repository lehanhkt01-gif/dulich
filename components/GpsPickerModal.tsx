'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Check, MapPin, Compass } from 'lucide-react';

interface GpsPickerModalProps {
  initialLat: number;
  initialLng: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function GpsPickerModal({
  initialLat,
  initialLng,
  onSelect,
  onClose,
}: GpsPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(initialLat || 13.070029);
  const [currentLng, setCurrentLng] = useState(initialLng || 107.883355);
  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current!, {
        center: [currentLat, currentLng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      mapRef.current = map;

      marker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setCurrentLat(lat);
        setCurrentLng(lng);
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setCurrentLat(lat);
        setCurrentLng(lng);
        marker.setLatLng([lat, lng]);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#E7E2D7] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E2D7] flex items-center justify-between bg-[#FBF9F5]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#2D5A43]" />
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">
              Chấm Tọa Độ GPS Di Tích Trên Bản Đồ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div ref={mapContainerRef} className="w-full h-96" />
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E7E2D7] text-xs font-mono text-[#1C1917] shadow">
            Nhấp chuột vào bản đồ hoặc kéo ghim để định vị
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FBF9F5] border-t border-[#E7E2D7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-stone-700 bg-white px-3 py-2 rounded-lg border border-[#E7E2D7]">
            Vĩ độ (Lat): <strong className="text-[#2D5A43]">{currentLat.toFixed(6)}</strong> | Kinh độ (Lng):{' '}
            <strong className="text-[#2D5A43]">{currentLng.toFixed(6)}</strong>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onSelect(currentLat, currentLng);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A43] hover:bg-[#234634] text-white text-xs font-bold shadow transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Tọa Độ Này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
