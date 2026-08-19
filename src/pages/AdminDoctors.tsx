import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Doctor {
  _id: string;
  user: { name: string; email: string };
  specialization: string;
  fee: number;
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialization: '', degree: '', experience: '', fee: '',
  });
  const [error, setError] = useState('');

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.doctors);
    } catch {
      console.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/doctors', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization,
        degree: formData.degree,
        experience: Number(formData.experience),
        fee: Number(formData.fee),
      });
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', specialization: '', degree: '', experience: '', fee: '' });
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      fetchDoctors();
    } catch {
      alert('Failed to remove doctor');
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-gray-100 rounded-lg p-4 mb-6 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="degree" placeholder="Degree" value={formData.degree} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="experience" type="number" placeholder="Experience (years)" value={formData.experience} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input name="fee" type="number" placeholder="Fee ($)" value={formData.fee} onChange={handleChange} required className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Create doctor
          </button>
        </form>
      )}

      <div className="space-y-3">
        {doctors.map((doc) => (
          <div key={doc._id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Dr. {doc.user.name}</p>
              <p className="text-sm text-gray-500">{doc.specialization} • ${doc.fee}</p>
            </div>
            <button onClick={() => handleDelete(doc._id)} className="text-sm text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}