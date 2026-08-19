import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface Doctor {
  _id: string;
  user: { name: string; email: string; profilePicture?: string };
  specialization: string;
  degree: string;
  experience: number;
  fee: number;
  bio?: string;
  availableSlots: string[];
}

export default function DoctorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data.doctor);
      } catch {
        setError('Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      setError('Only patients can book appointments');
      return;
    }
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setBooking(true);
    setError('');
    try {
      await api.post('/appointments', {
        doctorId: doctor?._id,
        timeSlot: selectedSlot,
      });
      navigate('/my-appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;
  if (!doctor) return <p className="text-center py-12 text-gray-500">Doctor not found</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-medium text-blue-700 overflow-hidden">
          {doctor.user.profilePicture ? (
            <img src={doctor.user.profilePicture} alt={doctor.user.name} className="w-full h-full object-cover" />
          ) : (
            doctor.user.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dr. {doctor.user.name}</h1>
          <p className="text-gray-500 text-sm">{doctor.specialization} • {doctor.degree}</p>
          <p className="text-gray-500 text-sm">{doctor.experience} years experience</p>
        </div>
      </div>

      {doctor.bio && <p className="text-gray-600 mb-6">{doctor.bio}</p>}

      <p className="text-lg font-medium text-gray-900 mb-4">Fee: ${doctor.fee}</p>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Available slots</p>
        <div className="flex flex-wrap gap-2">
          {doctor.availableSlots.length === 0 && (
            <p className="text-sm text-gray-400">No slots available</p>
          )}
          {doctor.availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                selectedSlot === slot
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        onClick={handleBook}
        disabled={booking}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {booking ? 'Booking...' : 'Book Appointment'}
      </button>
    </div>
  );
}