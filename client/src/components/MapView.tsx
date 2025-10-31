import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- START: Hardcoded Waste Data and Icons ---
const wasteData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Rosterman Dumpsite",
        type: "informal",
        category: "Informal Dumping Site",
        description:
          "Main dumping site in Rosterman. Over 95% of waste arriving is mixed. County government collaborates with local community groups to manage the site.",
        status: "Active",
        challenges: "Mixed waste, lack of segregation at source",
        image: "images/disposal worker.jpg",
      },
      geometry: { type: "Point", coordinates: [34.72066, 0.25509] },
    },
    {
      type: "Feature",
      properties: {
        name: "Regen Organics Fertilizer Processing Plant",
        type: "processing",
        category: "Waste Processing Facility",
        description:
          "Located in Mumias, processes organic waste into fertilizer. Accepts only organic waste for composting.",
        status: "Operational",
        challenges:
          "Small amounts of plastic often mixed in, requiring segregation",
      },
      geometry: { type: "Point", coordinates: [34.48796, 0.33474] },
    },
    {
      type: "Feature",
      properties: {
        name: "Khayenga Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located near Khayenga Market. Managed by Khayenga Self Help Group. Compartments for biodegradable and non-biodegradable waste are clearly marked.",
        status: "Active",
        challenges: "Local community unaware of need to separate waste",
        image: "images/khayega refuse.jpg",
      },
      geometry: { type: "Point", coordinates: [34.77152, 0.20819] },
    },
    {
      type: "Feature",
      properties: {
        name: "Lurambi Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located in Lurambi Market. Operated by well-organized youth and community groups. Compartments for biodegradable and non-biodegradable waste.",
        status: "Active",
        challenges: "Waste often mixed despite compartmentalization",
        image: "images/lurambi waste.jpg",
      },
      geometry: { type: "Point", coordinates: [34.76485, 0.2998] },
    },
    {
      type: "Feature",
      properties: {
        name: "Sichirayi Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Formal waste collection point in Sichirayi area. Part of the municipal waste management system.",
        status: "Active",
        challenges: "Requires better community awareness for waste segregation",
      },
      geometry: { type: "Point", coordinates: [34.745, 0.315] },
    },
    {
      type: "Feature",
      properties: {
        name: "Masingo Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Located close to fresh food market. Majority of waste is organic. Informal dumping site exists nearby.",
        status: "Active",
        challenges: "Informal dumping site just 10 meters away",
        image: "images/bird image.jpg",
      },
      geometry: { type: "Point", coordinates: [34.7505, 0.285] },
    },
    {
      type: "Feature",
      properties: {
        name: "Amelemba Scheme Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Formal waste collection point in Amelemba Scheme area.",
        status: "Active",
        challenges: "Community engagement needed for proper waste segregation",
      },
      geometry: { type: "Point", coordinates: [34.755, 0.295] },
    },
    {
      type: "Feature",
      properties: {
        name: "Mevic Waste Management",
        type: "plastic",
        category: "Plastic Waste Collection Yard",
        description:
          "Plastic waste collection yard managed by Mevic Waste Management. Specializes in plastic, metal, and paper/carton collection.",
        status: "Operational",
        challenges:
          "Vested interests in plastic/metal discourage organic waste focus",
      },
      geometry: { type: "Point", coordinates: [34.753, 0.283] },
    },
    {
      type: "Feature",
      properties: {
        name: "Kambi Somali Refuse Chamber",
        type: "formal",
        category: "Formal Waste Receptacle",
        description:
          "Refuse chamber in Kambi Somali area. Built within market walls with narrow passages.",
        status: "Active",
        challenges: "Narrow passages limit proper waste collection and segregation",
      },
      geometry: { type: "Point", coordinates: [34.752, 0.286] },
    },
    {
      type: "Feature",
      properties: {
        name: "Shirere Waste Collection",
        type: "formal",
        category: "Formal Waste Receptacle",
        description: "Waste collection point in Shirere Ward.",
        status: "Active",
        challenges: "Community awareness needed",
      },
      geometry: { type: "Point", coordinates: [34.735, 0.265] },
    },
  ],
};

const icons = {
  formal: L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #006400; width: 30px; height: 30px; border-radius: 50%; display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  informal: L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  processing: L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #3498db; width: 30px; height: 30px; border-radius: 50%; display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  plastic: L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #f39c12; width: 30px; height: 30px; border-radius: 50%; display:flex;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:18px;">📍</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
};
// --- END: Hardcoded Data and Icons ---

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  siteName: string;
  wasteType: string;
  volume: number;
  date: Date;
}

interface MapViewProps {
  markers?: MapMarker[];
  onMarkerClick: (marker: MapMarker) => void;
  selectedMarker: MapMarker | null;
}

export default function MapView({ onMarkerClick, selectedMarker }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRefs = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = L.map(mapContainer.current, { zoomControl: true });
    mapInstance.current = map;

    // Base map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Kakamega boundary
    fetch("/Kakamega County.geojson")
      .then((r) => r.json())
      .then((data) => {
        L.geoJSON(data, {
          style: { color: "black", weight: 2, opacity: 1, fillOpacity: 0 },
        }).addTo(map);
      });

    // Add waste markers
    const bounds = L.latLngBounds([]);
    wasteData.features.forEach((feature) => {
      const [lon, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      const icon = icons[props.type as keyof typeof icons];

      const popupContent = `
        <div style="font-family:Arial,sans-serif;max-width:300px;">
          <h3 style="margin:0 0 10px;font-size:16px;">${props.name}</h3>
          <p><strong>Category:</strong> ${props.category}</p>
          <p><strong>Status:</strong> ${props.status}</p>
          <p><strong>Description:</strong> ${props.description}</p>
          <p><strong>Challenges:</strong> ${props.challenges}</p>
          ${props.image ? `<img src="${props.image}" alt="${props.name}" style="margin-top:10px;max-width:100%;border-radius:4px;">` : ""}
          <button class="get-directions-btn" data-lat="${lat}" data-lon="${lon}" style="margin-top:10px;padding:6px 10px;background-color:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">Get Directions</button>
        </div>`;

      const marker = L.marker([lat, lon], { icon }).bindPopup(popupContent);

      marker.on("click", () => {
        onMarkerClick({
          id: 0,
          lat,
          lng: lon,
          siteName: props.name,
          wasteType: props.type,
          volume: 0,
          date: new Date(),
        });

        // Smooth pan + popup open
        map.panTo([lat, lon], { animate: true, duration: 0.6 });
        setTimeout(() => marker.openPopup(), 400);
      });

      marker.addTo(map);
      markerRefs.current.push(marker);
      bounds.extend([lat, lon]);
    });

    map.fitBounds(bounds, { padding: [30, 30] });
    L.control.scale({ metric: true }).addTo(map);

    // Directions button listener
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target && target.matches(".get-directions-btn")) {
        const lat = target.dataset.lat;
        const lon = target.dataset.lon;
        if (lat && lon) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank");
        }
      }
    });
  }, [onMarkerClick]);

  // Highlight selected marker
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedMarker) return;

    const marker = markerRefs.current.find(
      (m) =>
        m.getLatLng().lat === selectedMarker.lat &&
        m.getLatLng().lng === selectedMarker.lng
    );

    if (marker) {
      map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
      setTimeout(() => marker.openPopup(), 300);
    }
  }, [selectedMarker]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-input">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
