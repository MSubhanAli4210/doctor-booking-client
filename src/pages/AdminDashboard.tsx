import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
      } catch {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Patients</p>
          <p className="text-2xl font-semibold text-gray-900">{stats?.totalPatients ?? 0}</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Doctors</p>
          <p className="text-2xl font-semibold text-gray-900">{stats?.totalDoctors ?? 0}</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-5">
          <p className="text-sm text-gray-500">Appointments</p>
          <p className="text-2xl font-semibold text-gray-900">{stats?.totalAppointments ?? 0}</p>
        </div>
      </div>
    </div>
  );
}