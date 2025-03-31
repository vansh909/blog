import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:4000/user/activity', {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        });

        console.log('Activity feed response:', response.data);

        if (response.data.activites) {
          setActivities(response.data.activites);
        } else if (response.data.message === "No Recent Activity found!") {
          setActivities([]);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.response?.data || 'Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatActivityTime = (timestamp) => {
    try {
      return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'some time ago';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Feed</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center space-x-4">
                <div className="h-3 w-3 bg-blue-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Feed</h2>
        {error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : activities.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No recent activities</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mr-4 ${
                  activity.type === 'like' ? 'bg-pink-500' :
                  activity.type === 'comment' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-800">{activity.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatActivityTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;