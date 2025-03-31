import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/profile', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true
        });
        setUser(response.data.profileDetails);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-indigo-600">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user?.username}</h2>
              <p className="text-indigo-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 p-6 text-center">
          <div 
            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowFollowers(true)}
          >
            <p className="text-4xl font-bold text-indigo-600">{user?.followerCount || 0}</p>
            <p className="text-gray-600 mt-1">Followers</p>
          </div>
          <div 
            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowFollowing(true)}
          >
            <p className="text-4xl font-bold text-indigo-600">{user?.followingCount || 0}</p>
            <p className="text-gray-600 mt-1">Following</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-4xl font-bold text-indigo-600">0</p>
            <p className="text-gray-600 mt-1">Posts</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="text-xl font-semibold mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Username:</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="p-6 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Pending Follow Requests</h3>
          <PendingRequests />
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowers && <FollowersList onClose={() => setShowFollowers(false)} />}
      {showFollowing && <FollowingList onClose={() => setShowFollowing(false)} />}

      {/* MyBlogs Component */}
      <MyBlogs userId={user?.id} />
    </div>
  );
};

// Add this new component for pending requests
const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:4000/follow/requests', {
        headers: { Authorization: `Bearer ${authToken}` },
        withCredentials: true
      });

      // Add debug logging
      console.log('Requests response:', response.data);
      
      // Handle both successful responses
      if (response.data && Array.isArray(response.data.requests)) {
        setRequests(response.data.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (followId, responseType) => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:4000/follow/requests/${followId}`,
        { response: responseType },
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      // Show success message
      alert(`Request ${responseType} successfully!`);
      
      // Refresh requests
      fetchPendingRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      alert(error.response?.data?.message || 'Failed to handle request');
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  if (loading) return <p className="text-gray-600">Loading requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending follow requests</p>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {request.username[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{request.username}</p>
                <p className="text-sm text-gray-500">{request.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRequest(request._id, 'accepted')}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => handleRequest(request._id, 'rejected')}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Add this new component for displaying followers
const FollowersList = ({ onClose }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/follow/followers', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true
        });
        setFollowers(response.data.Followers || []);
      } catch (err) {
        console.error('Error fetching followers:', err);
        setError('Failed to fetch followers');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Your Followers</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading followers...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {followers.map((follower, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {follower.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{follower.username}</p>
                <p className="text-sm text-gray-500">{follower.email}</p>
              </div>
            </div>
          ))}
          {!loading && followers.length === 0 && (
            <p className="text-gray-600 text-center">No followers yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Add new FollowingList component
const FollowingList = ({ onClose }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/follow/following', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true
        });
        setFollowing(response.data.Following || []);
      } catch (err) {
        console.error('Error fetching following:', err);
        setError('Failed to fetch following users');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">People You Follow</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading following list...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {following.map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
          {!loading && following.length === 0 && (
            <p className="text-gray-600 text-center">You're not following anyone yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Update MyBlogs component to match the new design
const MyBlogs = ({ userId }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/blogs/myblogs', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        });
        
        // Debug logging
        console.log('MyBlogs response:', response.data);
        
        // Update this line to handle the nested structure
        const blogsData = response.data.blogs || [];
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
        
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to fetch your blogs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, []);

  if (loading) return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Your Blogs</h3>
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="h-52 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Your Blogs</h3>
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Your Blogs</h3>
        <button
          onClick={() => navigate('/create')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Blog
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't written any blogs yet.</p>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Write Your First Blog
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {blog.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h4>
                <p className="text-gray-600 mb-4 line-clamp-2">{blog.desc}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                  
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      {blog.likeCount || 0}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {blog.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
