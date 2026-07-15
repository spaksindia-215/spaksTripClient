"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Read-only combined map for an itinerary — plots every day's pinned location as a
// numbered, highlighted marker and auto-fits the view to show them all. Reuses the
// same MapLibre + Geoapify style as LocationPicker, just without the search/drag
// editing chrome. Degrades to nothing (not a broken map) when no Geoapify key is
// configured or fewer than 2 points have a location — a single point is already
// covered by the itinerary day's own "View on map" link.

export type ItineraryMapPoint = {
  day?: number;
  label: string;
  lat: number;
  lng: number;
  // Overrides the numbered marker text (e.g. "S" for a route's start/origin pin).
  badge?: string;
};

const KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
const STYLE = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${KEY}`;

// `route` additionally draws a line connecting the points in the given order
// (origin → day 1 → day 2 …) so a fixed-route package reads as a route, not a
// scatter of pins.
export default function ItineraryMap({ points, route = false }: { points: ItineraryMapPoint[]; route?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);

  useEffect(() => {
    if (!KEY || !containerRef.current || points.length < 2) return;
    let disposed = false;

    void (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !containerRef.current) return;

      const bounds = new maplibregl.LngLatBounds();
      points.forEach((p) => bounds.extend([p.lng, p.lat]));

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE,
        bounds,
        fitBoundsOptions: { padding: 48, maxZoom: 12 },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      map.on("styleimagemissing", (e: { id: string }) => {
        if (!map.hasImage(e.id)) {
          const blank = new ImageData(new Uint8ClampedArray(4), 1, 1);
          map.addImage(e.id, blank);
        }
      });

      if (route) {
        map.on("load", () => {
          map.addSource("itinerary-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: points.map((p) => [p.lng, p.lat]) },
            },
          });
          map.addLayer({
            id: "itinerary-route",
            type: "line",
            source: "itinerary-route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#1e4fc7", "line-width": 3, "line-dasharray": [1.6, 1.2], "line-opacity": 0.85 },
          });
        });
      }

      markersRef.current = points.map((p, i) => {
        const el = document.createElement("div");
        el.className = "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-[12px] font-bold text-white shadow-md";
        el.textContent = p.badge ?? String(p.day ?? i + 1);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .setPopup(new maplibregl.Popup({ offset: 16 }).setText(p.label))
          .addTo(map);
        return marker;
      });

      mapRef.current = map;
    })();

    return () => {
      disposed = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points, route]);

  if (!KEY || points.length < 2) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-bold text-ink">Route map</p>
      <div ref={containerRef} className="h-80 w-full overflow-hidden rounded-xl border border-border-soft" />
    </div>
  );
}
