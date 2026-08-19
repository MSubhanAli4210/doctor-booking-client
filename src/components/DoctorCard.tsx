import { Link } from 'react-router-dom';
import type { DoctorProfile } from '../types';

const DoctorCard = ({ doctor }: { doctor: DoctorProfile }) => {
  const initials = doctor.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700 shrink-0 overflow-hidden">
          {doctor.user.profilePicture ? (
            <img src={doctor.user.profilePicture} alt={doctor.user.name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{doctor.user.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {doctor.specialty} · {doctor.experienceYears} yrs exp
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm font-semibold text-gray-900">${doctor.fees}</span>
        <Link
          to={`/doctors/${doctor._id}`}
          className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;