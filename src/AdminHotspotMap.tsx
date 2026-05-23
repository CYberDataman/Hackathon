import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

interface Props {
  token: string;
}

interface Report {
  reportId: string;
  name: string;
  location: string;
  category: string;
  description: string;
  status: string;
  photoUrl: string;
  timestamp: string;
  lat?: number | null;
  lng?: number | null;
}

const API = 'https://t8h3i6vyia.execute-api.ap-southeast-1.amazonaws.com/prod';

// Status-based marker icons
const statusIcons: Record<string, L.Icon> = {
  pending: new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  'in progress': new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  resolved: new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

const defaultIcon = new L.Icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function AdminHotspotMap({ token }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        console.log('HotspotMap TOKEN:', token);
        const res = await fetch(`${API}/reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('HotspotMap /reports status:', res.status);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load reports for map', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadReports();
    }
  }, [token]);

  const singaporeCenter: [number, number] = [1.3521, 103.8198];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Header with nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900">Hotspot Map</h1>
            <div className="flex gap-3 text-xs">
              <Link
                to="/admin"
                className="text-blue-600 hover:underline"
              >
                Dashboard
              </Link>
              <span className="text-gray-400">·</span>
              <Link
                to="/admin/hotspot-map"
                className="text-blue-600 hover:underline"
              >
                Hotspot Map
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Visual overview of report locations across the estate.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading reports...</p>
        ) : (
          <div
            className="bg-white rounded-2xl shadow-md overflow-hidden relative"
            style={{ height: '70vh' }}
          >
            <MapContainer
              center={singaporeCenter}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {reports
                .filter(r => r.lat != null && r.lng != null)
                .map(r => (
                  <Marker
                    key={r.reportId}
                    position={[Number(r.lat), Number(r.lng)]}
                    icon={statusIcons[r.status] || defaultIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">
                          {r.name || 'Anonymous'}
                        </p>
                        <p className="text-gray-600">{r.location}</p>
                        <p className="text-xs text-gray-500">
                          {r.category} · {r.status}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-xl shadow px-3 py-2 text-xs text-gray-800 space-y-1">
              <p className="font-semibold text-[11px] text-gray-600 mb-1">
                Legend
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600" />
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 border border-blue-700" />
                <span>In progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 border border-green-700" />
                <span>Resolved</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}