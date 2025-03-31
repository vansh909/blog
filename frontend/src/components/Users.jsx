import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/users', {
        withCredentials: true
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:4000/follow/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true
        }
      );
      // Refresh users list or update UI
      fetchUsers();
    } catch (error) {
      console.error('Error following user:', error);
      setError(error.response?.data?.message || 'Failed to follow user');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-xl text-gray-600">Loading users...</p>
    </div>
  );

  if (error) return (
    <div className="text-center mt-10">
      <p className="text-red-500 mb-4">{error}</p>
      <button
        onClick={fetchUsers}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Find Users to Follow</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div 
            key={user._id} 
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* User Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-indigo-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Account Privacy Status */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${user.isPrivate 
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'}`}
              >
                <span className={`w-2 h-2 rounded-full mr-2
                  ${user.isPrivate ? 'bg-yellow-400' : 'bg-green-400'}`}
                />
                {user.isPrivate ? 'Private Account' : 'Public Account'}
              </span>
            </div>

            {/* Account Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {user.isPrivate 
                  ? "This account's content is private. Follow to request access."
                  : "This account's content is public. Follow to see their posts."}
              </p>
            </div>

            {/* Follow Button */}
            <button
              onClick={() => handleFollow(user._id)}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 
                transition-colors duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {user.isPrivate ? 'Request to Follow' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <div className="text-center mt-10 p-8 bg-white rounded-xl shadow-md">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-xl text-gray-600 mt-4">
            No users found. Be the first one to create content!
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;