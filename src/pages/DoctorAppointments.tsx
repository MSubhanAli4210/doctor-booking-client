import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Appointment {
  _id: string;
  patient: { name: string; email: string };
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/doctor');
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch {
      alert('Failed to update appointment');
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Appointments</h1>

      {appointments.length === 0 && (
        <p className="text-gray-500">No appointments yet.</p>
      )}

      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt._id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{apt.patient.name}</p>
              <p className="text-sm text-gray-500">{apt.patient.email} • {apt.timeSlot}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {apt.status}
              </span>
            </div>
            {apt.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(apt._id, 'confirmed')}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => updateStatus(apt._id, 'cancelled')}
                  className="text-sm text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}
            {apt.status === 'confirmed' && (
              <button
                onClick={() => updateStatus(apt._id, 'completed')}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                Mark completed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}