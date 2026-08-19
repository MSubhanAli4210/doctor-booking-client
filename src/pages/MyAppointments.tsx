import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Appointment {
  _id: string;
  doctor: { user: { name: string }; specialization: string };
  timeSlot: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment: { status: 'unpaid' | 'paid' };
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/mine');
      setAppointments(res.data.appointments);
    } catch {
      console.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch {
      alert('Failed to cancel appointment');
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Appointments</h1>

      {appointments.length === 0 && (
        <p className="text-gray-500">You have no appointments yet.</p>
      )}

      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt._id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Dr. {apt.doctor.user.name}</p>
              <p className="text-sm text-gray-500">{apt.doctor.specialization} • {apt.timeSlot}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {apt.status}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  apt.payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {apt.payment.status}
                </span>
              </div>
            </div>
            {apt.status === 'pending' && (
              <button
                onClick={() => handleCancel(apt._id)}
                className="text-sm text-red-600 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}