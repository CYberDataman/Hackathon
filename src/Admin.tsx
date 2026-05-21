import { useEffect, useState } from 'react';

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
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function Admin() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch(`${API}/reports`)
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  async function updateStatus(reportId: string, newStatus: string) {
    await fetch(`${API}/report/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    setReports(prev =>
      prev.map(r => r.reportId === reportId ? { ...r, status: newStatus } : r)
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <div key={r.reportId} className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">{r.timestamp?.slice(0, 10)}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                {r.status}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800">{r.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">{r.location || 'N/A'}</p>
            <p className="text-sm text-gray-500">{r.category || 'N/A'}</p>
            <p className="text-sm text-gray-700">{r.description || 'N/A'}</p>
            {r.photoUrl && <img src={r.photoUrl} alt="report" className="rounded-lg w-full object-cover max-h-48" />}
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
  );
}