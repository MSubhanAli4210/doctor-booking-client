import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function DoctorProfile() {
  const [formData, setFormData] = useState({
    specialization: '',
    degree: '',
    experience: '',
    fee: '',
    bio: '',
    availableSlots: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/doctors/me');
        const d = res.data.doctor;
        setFormData({
          specialization: d.specialization || '',
          degree: d.degree || '',
          experience: String(d.experience || ''),
          fee: String(d.fee || ''),
          bio: d.bio || '',
          availableSlots: (d.availableSlots || []).join(', '),
        });
      } catch {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/doctors/me', {
        specialization: formData.specialization,
        degree: formData.degree,
        experience: Number(formData.experience),
        fee: Number(formData.fee),
        bio: formData.bio,
        availableSlots: formData.availableSlots.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>

      {message && <p className="text-sm mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
          <input
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
          <input
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee ($)</label>
            <input
              name="fee"
              type="number"
              value={formData.fee}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available slots (comma separated)
          </label>
          <input
            name="availableSlots"
            value={formData.availableSlots}
            onChange={handleChange}
            placeholder="10:00 AM, 11:00 AM, 2:00 PM"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}