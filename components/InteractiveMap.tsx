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
  height = '350px',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const boundaryBoundsRef = useRef<any>(null);
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

        // 1. Ảnh Vệ Tinh Viễn Thám Kết Hợp Nhãn Thôn Buôn & Đường Xá (MẶC ĐỊNH)
        const satelliteImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
          maxZoom: 19,
        });

        const satelliteLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          attribution: '',
          maxZoom: 19,
        });

        const satelliteGroup = L.layerGroup([satelliteImagery, satelliteLabels]);

        // 2. OpenStreetMap Chuẩn (Bản đồ Đường & Thôn Buôn)
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        });

        // 3. Bản đồ Địa hình Rừng Núi (ESRI Topo Map)
        const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &copy; USGS, NOAA',
          maxZoom: 18,
        });

        // THIẾT LẬP MẶC ĐỊNH LÀ BẢN ĐỒ VỆ TINH
        satelliteGroup.addTo(map);

        // Zoom control đặt ở góc phải dưới
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;

        // Tải và tích hợp lớp Ranh giới 20 thôn buôn Ea Súp từ file GeoJSON (chuyển đổi từ Google My Maps)
        fetch('/data/easup-boundary.geojson')
          .then((res) => res.json())
          .then((geoData) => {
            if (!mapInstanceRef.current) return;

            const boundaryLayer = L.geoJSON(geoData as any, {
              style: (feature: any) => {
                const geomType = feature?.geometry?.type;
                const isPolygon = geomType === 'Polygon' || geomType === 'MultiPolygon';
                const color = feature?.properties?.color || (isPolygon ? '#2563EB' : '#DC2626');
                return {
                  color: color,
                  weight: isPolygon ? 2.5 : 3,
                  opacity: 0.95,
                  fillColor: color,
                  fillOpacity: isPolygon ? 0.16 : 0,
                };
              },
              onEachFeature: (feature: any, layer: any) => {
                const name = feature?.properties?.name || 'Ranh giới thôn buôn Ea Súp';
                const desc = feature?.properties?.description || 'Địa phận thôn buôn sau sáp nhập';
                
                layer.bindTooltip(
                  `<div style="font-family: inherit; padding: 2px 4px;">
                    <div style="font-weight: 700; color: #1C1917; font-size: 12px;">${name}</div>
                    <div style="font-size: 11px; color: #57534E;">${desc}</div>
                  </div>`,
                  { sticky: true, className: 'custom-heritage-popup' }
                );

                layer.on({
                  mouseover: (e: any) => {
                    const target = e.target;
                    target.setStyle({
                      weight: 4.5,
                      fillOpacity: 0.3,
                    });
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                      target.bringToFront();
                    }
                  },
                  mouseout: (e: any) => {
                    boundaryLayer.resetStyle(e.target);
                  },
                });
              },
            });

            // Mặc định hiển thị toàn bộ các lớp ranh giới lên bản đồ
            boundaryLayer.addTo(map);

            boundaryBoundsRef.current = boundaryLayer.getBounds();
            // Tự động bao quát toàn cảnh ranh giới 20 thôn buôn của xã Ea Súp
            if (boundaryLayer.getBounds().isValid()) {
              const group = markersRef.current.length > 0 ? L.featureGroup(markersRef.current) : null;
              if (group && group.getBounds().isValid()) {
                map.fitBounds(boundaryLayer.getBounds().extend(group.getBounds()).pad(0.06));
              } else {
                map.fitBounds(boundaryLayer.getBounds().pad(0.06));
              }
            }

            // Bổ sung lớp phủ vào Bộ chuyển đổi lớp (Layer control)
            L.control.layers(
              {
                '🛰️ Bản Đồ Vệ Tinh (Mặc định)': satelliteGroup,
                '🗺️ Bản Đồ Đường & Thôn Buôn': osmLayer,
                '⛰️ Bản Đồ Địa Hình Rừng Khộp': topoLayer,
              },
              {
                '📍 Ranh giới 20 thôn buôn (Google My Maps)': boundaryLayer,
              },
              { position: 'topright' }
            ).addTo(map);
          })
          .catch((err) => {
            console.error('Không thể tải ranh giới Ea Súp GeoJSON:', err);
            // Fallback nếu không tải được geojson
            L.control.layers(
              {
                '🛰️ Bản Đồ Vệ Tinh (Mặc định)': satelliteGroup,
                '🗺️ Bản Đồ Đường & Thôn Buôn': osmLayer,
                '⛰️ Bản Đồ Địa Hình Rừng Khộp': topoLayer,
              },
              undefined,
              { position: 'topright' }
            ).addTo(map);
          });
      }

      const map = mapInstanceRef.current;

      // Xóa markers cũ
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Custom Heritage SVG Pin Icon
      const createCustomIcon = (isFeatured: boolean, isFood: boolean = false) => {
        const color = isFood ? '#D9452B' : isFeatured ? '#A64B2A' : '#0066CC';
        const innerSvg = isFood
          ? `<svg style="transform: rotate(45deg); width: 17px; height: 17px; fill: white;" viewBox="0 0 24 24">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
            </svg>`
          : `<svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>`;

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
            ${innerSvg}
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
        const isFood = dest.categoryId === 'cat-am-thuc' || dest.category?.slug === 'am-thuc-quan-ngon';
        const marker = L.marker([dest.latitude, dest.longitude], {
          icon: createCustomIcon(dest.isFeatured, isFood),
        }).addTo(map);

        // Tạo Popup HTML tùy chỉnh phong cách tạp chí di sản
        const popupContent = `
          <div style="width: 260px; font-family: inherit;">
            <div style="height: 120px; overflow: hidden; position: relative;">
              <img src="${dest.thumbnail}" alt="${dest.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              ${
                dest.isFeatured
                  ? `<span style="position: absolute; top: 8px; left: 8px; background: ${isFood ? '#D9452B' : '#A64B2A'}; color: white; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">${isFood ? 'QUÁN NGON' : 'TIÊU BIỂU'}</span>`
                  : ''
              }
            </div>
            <div style="padding: 12px 14px;">
              <p style="font-size: 11px; color: ${isFood ? '#D9452B' : '#0066CC'}; font-weight: 600; text-transform: uppercase; margin: 0 0 4px 0;">
                ${dest.category?.name || (isFood ? 'Ẩm thực & Quán ngon' : 'Di tích & Danh thắng')}
              </p>
              <h4 style="font-size: 14px; font-weight: 700; color: #1C1917; margin: 0 0 6px 0; line-height: 1.3;">
                ${dest.title}
              </h4>
              <p style="font-size: 11px; color: #57534E; margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${dest.address}
              </p>
              <div style="display: flex; gap: 8px; border-top: 1px solid #E7E2D7; padding-top: 8px;">
                <a href="${isFood ? '/mon-ngon' : `/destinations/${dest.slug}`}" style="
                  flex: 1;
                  display: inline-block;
                  background: ${isFood ? '#D9452B' : '#0066CC'};
                  color: white;
                  font-size: 12px;
                  font-weight: 600;
                  text-align: center;
                  padding: 6px 0;
                  border-radius: 6px;
                  text-decoration: none;
                ">${isFood ? '🍽️ Món ngon & Rủ đi' : 'Xem bài viết'}</a>
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
            background: #0066CC;
            border: 3px solid #C6923C;
            box-shadow: 0 4px 18px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            cursor: pointer;
          ">
            <img src="/logo-easup-official.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo Xã Ea Súp" />
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
          <div style="width: 58px; height: 58px; border-radius: 50%; overflow: hidden; margin: 0 auto 8px auto; border: 2px solid #0066CC; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <img src="/logo-easup-official.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo Xã Ea Súp" />
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #A64B2A; text-transform: uppercase; letter-spacing: 0.5px;">TRUNG TÂM VĂN HÓA & DU LỊCH</span>
          <h4 style="font-size: 15px; font-weight: 800; color: #1C1917; margin: 3px 0 2px 0;">XÃ EA SÚP</h4>
          <p style="font-size: 11px; color: #57534E; margin: 0 0 10px 0;">Tỉnh Đắk Lắk</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=13.070029,107.883355" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            width: 100%;
            background: #0066CC;
            color: white;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 0;
            border-radius: 8px;
            text-decoration: none;
            box-shadow: 0 2px 6px rgba(0,102,204,0.3);
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
        const markersBounds = group.getBounds();
        if (boundaryBoundsRef.current && boundaryBoundsRef.current.isValid() && selectedCategory === 'all') {
          map.fitBounds(markersBounds.extend(boundaryBoundsRef.current).pad(0.06));
        } else {
          map.fitBounds(markersBounds.pad(0.15));
        }
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
      {/* Google My Maps Action */}
      <div className="absolute top-3 left-14 z-20">
        <a
          href="https://www.google.com/maps/d/viewer?mid=1TpQUCEXOZcK88BsqXkT3gPzaDzsctP8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E7E2D7] text-xs font-bold text-stone-800 hover:text-[#0066CC] hover:border-[#0066CC] shadow-sm transition-all hover:scale-105"
          title="Mở toàn màn hình trên Google My Maps"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#0066CC]" />
          <span>Mở Google My Maps</span>
        </a>
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
          <span className="w-3 h-3 rounded-full bg-[#0066CC]"></span>
          <span className="font-medium text-stone-700">Di tích & Thắng cảnh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2 rounded-sm border border-red-500 bg-red-400/20"></span>
          <span className="font-medium text-stone-700">Ranh giới 20 thôn buôn</span>
        </div>
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </div>
  );
}
