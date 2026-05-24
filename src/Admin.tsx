import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  token: string;
  onLogout: () => void;
}

const API = 'https://t8h3i6vyia.execute-api.ap-southeast-1.amazonaws.com/prod';

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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function Admin({ token, onLogout }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in progress' | 'resolved'>('all');

  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const inProgressCount = reports.filter(r => r.status === 'in progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const filteredReports =
    statusFilter === 'all'
      ? reports
      : reports.filter(r => r.status === statusFilter);

  useEffect(() => {
    const loadReports = async () => {
      console.log('Admin TOKEN:', token);
      const res = await fetch(`${API}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Admin /reports status:', res.status);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    };

    if (token) {
      loadReports();
    }
  }, [token]);

  async function updateStatus(reportId: string, newStatus: string) {
    await fetch(`${API}/report/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    setReports(prev =>
      prev.map(r =>
        r.reportId === reportId ? { ...r, status: newStatus } : r
      )
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
          </div>

          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200"
          >
            Sign Out
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-white rounded-xl shadow-md px-4 py-3">
            <p className="text-gray-500">Total reports</p>
            <p className="text-xl font-semibold text-gray-900">{totalReports}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md px-4 py-3">
            <p className="text-gray-500">Pending</p>
            <p className="text-xl font-semibold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md px-4 py-3">
            <p className="text-gray-500">In progress</p>
            <p className="text-xl font-semibold text-blue-700">{inProgressCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md px-4 py-3">
            <p className="text-gray-500">Resolved</p>
            <p className="text-xl font-semibold text-green-700">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-sm">
          <p className="text-gray-500">
            Showing {filteredReports.length} of {totalReports} reports
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Filter by status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(r => (
            <div
              key={r.reportId}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500">
                  {r.timestamp?.slice(0, 10)}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    statusColors[r.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <p className="text-lg font-bold text-gray-800">
                {r.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {r.location || 'N/A'}
              </p>
              {r.lat != null && r.lng != null && (
                <p className="text-xs text-gray-400">
                  {Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {r.category || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                {r.description || 'N/A'}
              </p>

              {r.photoUrl && (
                <img
                  src={r.photoUrl}
                  alt="report"
                  className="rounded-lg w-full object-cover max-h-48"
                />
              )}

              <select
                value={r.status}
                onChange={e => updateStatus(r.reportId, e.target.value)}
                className="mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}