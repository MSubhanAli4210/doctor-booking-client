import { useState, useEffect } from 'react';
import { getAllDoctors } from '../api/doctorApi';
import DoctorCard from '../components/DoctorCard';
import type { DoctorProfile } from '../types';

const specialties = ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology'];

const Home = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDoctors = async (specialty?: string) => {
    setIsLoading(true);
    try {
      const data = await getAllDoctors(specialty);
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSpecialty('');
    fetchDoctors(searchTerm);
  };

  const handleSpecialtyClick = (specialty: string) => {
    const next = activeSpecialty === specialty ? '' : specialty;
    setActiveSpecialty(next);
    setSearchTerm('');
    fetchDoctors(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Find your doctor</h1>
      <p className="text-sm text-gray-500 mb-6">Book appointments with trusted specialists near you.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by specialty, e.g. cardiology"
          className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white text-sm font-medium px-5 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2 flex-wrap mb-8">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => handleSpecialtyClick(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              activeSpecialty === s
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="text-sm text-gray-400">No doctors found. Try a different search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;