'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Destination } from '@/lib/types';
import { MapPin, Navigation, Compass, ExternalLink, Layers } from 'lucide-react';
import Link from 'next/link';

interface InteractiveMapProps {
  destinations: Destination[];
  selectedCategory?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
}

export default function InteractiveMap({
  destinations,
  selectedCategory = 'all',
  initialCenter = [13.070029, 107.883355], // Vị trí xã Ea Súp, tỉnh Đắk Lắk (13.070029, 107.883355)
  initialZoom = 12,
  height = '540px',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Load leaflet dynamically
    import('leaflet').then((L) => {
      // Fix default icons in Leaflet when bundled with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Khởi tạo Leaflet Map
        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
        });

        // Add custom styled tile layer (CartoDB Positron / OpenStreetMap ấm áp)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        // Zoom control đặt ở góc phải dưới
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Xóa markers cũ
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Custom Heritage SVG Pin Icon
      const createCustomIcon = (isFeatured: boolean) => {
        const color = isFeatured ? '#A64B2A' : '#2D5A43';
        const svgIcon = `
          <div style="
            background: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;

        return L.divIcon({
          html: svgIcon,
          className: 'heritage-custom-pin',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });
      };

      // Lọc điểm theo danh mục
      const filtered = destinations.filter((d) => {
        if (!selectedCategory || selectedCategory === 'all') return true;
        return d.category?.slug === selectedCategory || d.categoryId === selectedCategory;
      });

      // Tạo marker cho từng điểm đến
      filtered.forEach((dest) => {
        const marker = L.marker([dest.latitude, dest.longitude], {
          icon: createCustomIcon(dest.isFeatured),
        }).addTo(map);

        // Tạo Popup HTML tùy chỉnh phong cách tạp chí di sản
        const popupContent = `
          <div style="width: 260px; font-family: inherit;">
            <div style="height: 120px; overflow: hidden; position: relative;">
              <img src="${dest.thumbnail}" alt="${dest.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              ${
                dest.isFeatured
                  ? '<span style="position: absolute; top: 8px; left: 8px; background: #A64B2A; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">TIÊU BIỂU</span>'
                  : ''
              }
            </div>
            <div style="padding: 12px 14px;">
              <p style="font-size: 11px; color: #2D5A43; font-weight: 600; text-transform: uppercase; margin: 0 0 4px 0;">
                ${dest.category?.name || 'Di tích & Danh thắng'}
              </p>
              <h4 style="font-size: 14px; font-weight: 700; color: #1C1917; margin: 0 0 6px 0; line-height: 1.3;">
                ${dest.title}
              </h4>
              <p style="font-size: 11px; color: #57534E; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${dest.address}
              </p>
              <div style="display: flex; gap: 8px; border-top: 1px solid #E7E2D7; padding-top: 8px;">
                <a href="/destinations/${dest.slug}" style="
                  flex: 1;
                  display: inline-block;
                  background: #2D5A43;
                  color: white;
                  font-size: 12px;
                  font-weight: 600;
                  text-align: center;
                  padding: 6px 0;
                  border-radius: 6px;
                  text-decoration: none;
                ">Xem bài viết</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}" target="_blank" rel="noopener noreferrer" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #F5F2EB;
                  color: #1C1917;
                  font-size: 12px;
                  padding: 6px 10px;
                  border-radius: 6px;
                  text-decoration: none;
                " title="Dẫn đường">
                  🧭
                </a>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-heritage-popup',
          maxWidth: 300,
        });

        marker.on('click', () => {
          setActiveDestination(dest);
        });

        markersRef.current.push(marker);
      });

      // Marker đặc biệt: Vị trí trung tâm Xã Ea Súp, Tỉnh Đắk Lắk (13.070029, 107.883355)
      const centerEaSupIcon = L.divIcon({
        html: `
          <div style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: #2D5A43;
            border: 3px solid #C6923C;
            box-shadow: 0 4px 18px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
          ">
            <img src="/logo-easup.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo Xã Ea Súp" />
          </div>
        `,
        className: 'center-easup-pin',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -24],
      });

      const centerMarker = L.marker([13.070029, 107.883355], {
        icon: centerEaSupIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      centerMarker.bindPopup(`
        <div style="width: 260px; font-family: inherit; padding: 12px 14px; text-align: center;">
          <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px auto; border: 2px solid #2D5A43; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <img src="/logo-easup.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo Xã Ea Súp" />
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #A64B2A; text-transform: uppercase; letter-spacing: 0.5px;">TRUNG TÂM VĂN HÓA & DU LỊCH</span>
          <h4 style="font-size: 15px; font-weight: 800; color: #1C1917; margin: 3px 0 2px 0;">XÃ EA SÚP</h4>
          <p style="font-size: 11px; color: #57534E; margin: 0 0 10px 0;">Tỉnh Đắk Lắk • Tọa độ: <strong>13.070029, 107.883355</strong></p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=13.070029,107.883355" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            width: 100%;
            background: #2D5A43;
            color: white;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 0;
            border-radius: 8px;
            text-decoration: none;
            box-shadow: 0 2px 6px rgba(45,90,67,0.3);
          ">🧭 Dẫn Đường Về Xã Ea Súp</a>
        </div>
      `, {
        className: 'custom-heritage-popup',
        maxWidth: 300,
      });

      markersRef.current.push(centerMarker);

      // Fit bounds nếu có điểm
      if (filtered.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      }
    });

    return () => {
      // Clean up map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destinations, selectedCategory]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E7E2D7] shadow-heritage bg-[#F5F2EB]">
      {/* Top Map Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-[#FFFFFF]/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E7E2D7] shadow-sm">
        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#2D5A43]">
          <img src="/logo-easup.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#1C1917] block leading-none">
            Bản Đồ Du Lịch Xã Ea Súp, Tỉnh Đắk Lắk
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            Tọa độ tâm: 13.070029, 107.883355
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2D5A43]/10 text-[#2D5A43] font-bold ml-1">
          {destinations.length} Điểm
        </span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E7E2D7] text-[11px] shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-amber-600 bg-amber-400"></span>
          <span className="font-semibold text-stone-800">Tâm Xã Ea Súp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#A64B2A]"></span>
          <span className="font-medium text-stone-700">Điểm Tiêu Biểu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2D5A43]"></span>
          <span className="font-medium text-stone-700">Di tích & Thắng cảnh</span>
        </div>
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </div>
  );
}
