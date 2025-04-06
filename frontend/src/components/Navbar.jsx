import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useAuth } from "../context/AuthContext";

// Add this helper function before the Navbar component
const formatTimeAgo = (timestamp) => {
  try {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'some time ago';
  }
};

const Navbar = () => {
    const { setIsAuthenticated } = useAuth(); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/user/activity', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        });
        
        // Make sure we're getting the correct data structure
        const activities = response.data.activites || [];
        console.log('Fetched activities:', activities);
        setActivities(activities);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchActivities();
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Update notification badge section
  const unreadActivities = activities.length;

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center relative">
      <Link to="/" className="text-lg font-bold">BlogBonds</Link>
      <div className="flex items-center space-x-4">
        {authToken ? (
          <>
            <Link 
              to="/blogs" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Blogs
            </Link>
            <Link 
              to="/create" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Post Blog
            </Link>
            <Link 
              to="/users" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Find Users
            </Link>
            <Link 
              to="/profile" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              Profile
            </Link>
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="hover:bg-blue-700 px-3 py-2 rounded transition-colors flex items-center"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Only show badge if there are activities */}
                {!loading && unreadActivities > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadActivities}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 text-gray-800">
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {loading ? (
                        <div className="animate-pulse space-y-3">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="flex items-center p-2">
                              <div className="w-2 h-2 bg-gray-200 rounded-full mr-3"></div>
                              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : activities.length > 0 ? (
                        activities.slice(0, 3).map((activity, index) => (
                          <div key={activity._id || index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mr-3 ${
                              activity.type === 'like' ? 'bg-pink-500' :
                              activity.type === 'comment' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}></div>
                            <p className="text-sm">
                              {activity.message}
                              <span className="text-gray-500 ml-2">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No recent activities</p>
                      )}
                    </div>
                    {activities.length > 0 && (
                      <button 
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 w-full text-center"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/activities');
                        }}
                      >
                        View All Activities
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors ml-2"
            >
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/login"
            className="hover:bg-blue-700 px-3 py-2 rounded transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
