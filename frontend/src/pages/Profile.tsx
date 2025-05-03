import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apis';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProfile(response.data);
    } catch (error) {
      // Redirect to login on failure
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center mt-10">No profile data found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 p-2">
              {profile.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 p-2">
              {profile.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 p-2">
              {profile.role === "1" ? 'Admin' : 'User'}
            </div>
          </div>
        </div>

      {profile.role === "1" && (
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Profile;