import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns'; // Install with: npm install date-fns

const BlogList = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (!localStorage.getItem('authToken')) {
      navigate('/login');
    } else {
      fetchBlogs();
    }
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:4000/blogs", {
        headers: { Authorization: `Bearer ${authToken}` },
        withCredentials: true,
      });
      
      // Debug logging
      console.log('Raw response:', response.data);
      console.log('Blog like counts:', response.data.map(blog => ({
        id: blog._id,
        title: blog.title,
        likeCount: blog.likeCount
      })));
      
      const validBlogs = response.data || [];
      const sortedBlogs = validBlogs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setBlogs(sortedBlogs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to fetch blogs. Please try again.");
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:4000/blogs/${blogId}/likes`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );

      // Show success message based on the action
      alert(response.data.message || "Blog interaction successful!");

      // Refresh blogs to get updated like count
      fetchBlogs();
    } catch (error) {
      console.error("Error liking blog:", error);
      // Show error message to user
      alert(error.response?.data?.message || "Failed to like blog");
    }
  };

  const fetchComments = async (blogId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:4000/comments/${blogId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        withCredentials: true,
      });
      setComments(prev => ({
        ...prev,
        [blogId]: response.data.comments
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleComment = async (blogId) => {
    try {
      if (!newComment[blogId]?.trim()) return;

      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://localhost:4000/comments/${blogId}`,
        { text: newComment[blogId] },
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );

      // Show success message
      alert(response.data.message || "Comment added successfully!");
      
      // Clear the comment input
      setNewComment({ ...newComment, [blogId]: '' });
      
      // Fetch updated comments
      await fetchComments(blogId);
      
      // Refresh blogs to update comment count
      await fetchBlogs();
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error.response?.data?.message || "Failed to post comment");
    }
  };

  useEffect(() => {
    Object.entries(showComments).forEach(([blogId, isShown]) => {
      if (isShown && (!comments[blogId] || comments[blogId].length === 0)) {
        fetchComments(blogId);
      }
    });
  }, [showComments]);

  if (loading) return <p className="text-center text-gray-600">Loading blogs...</p>;

  if (error) return (
    <div className="text-center">
      <p className="text-red-500">{error}</p>
      <button
        onClick={fetchBlogs}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  // Only show welcome message if truly no blogs AND user hasn't visited before
  if (blogs.length === 0 && !localStorage.getItem('hasVisited')) {
    localStorage.setItem('hasVisited', 'true'); // Mark as visited
    return <WelcomeMessage navigate={navigate} />;
  }

  // Show blogs or empty state
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Your Feed</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Blog
          </button>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            Find Users
          </button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No blogs in your feed yet.</p>
          <p className="text-gray-600 mt-2">Follow users or create your own blog to get started!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {blogs.map((blog) => (
            <div key={blog._id} 
               className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              {/* Author Info */}
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-indigo-600">
                    {blog.authorId?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{blog.authorId?.username}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(blog.createdAt), 'MMM d, yyyy')}

                  </p>
                </div>
              </div>

              {/* Blog Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{blog.title}</h3>
              
              {/* Blog Image */}
              {blog.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', blog.imageUrl);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.style.display = 'none'; // Hide broken image
                      // OR use a placeholder
                      // e.target.src = 'https://via.placeholder.com/640x360?text=Image+Not+Available';
                    }}
                    loading="lazy" // Add lazy loading
                  />
                </div>
              )}
              
              <p className="text-gray-600 mb-4">{blog.desc}</p>

              {/* Interaction Buttons */}
              <div className="flex items-center space-x-6 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleLike(blog._id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill={blog.likeCount > 0 ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {/* Use likeCount instead of likes array length */}
                  <span>{blog.likeCount || 0}</span>
                </button>

                <button
                  onClick={() => setShowComments({ ...showComments, [blog._id]: !showComments[blog._id] })}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {/* Update to use commentCount instead of comments.length */}
                  <span>{blog.commentCount || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[blog._id] && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-4">
                    {comments[blog._id]?.map((comment) => (
                      <div key={comment._id} className="flex space-x-3 bg-gray-50 rounded-lg p-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {comment.authorId?.username?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.authorId?.username}
                            </p>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex space-x-2 mt-4">
                    <input
                      type="text"
                      value={newComment[blog._id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [blog._id]: e.target.value })}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleComment(blog._id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Separate component for welcome message
const WelcomeMessage = ({ navigate }) => {
  const username = localStorage.getItem('username');
  return (
    <div className="max-w-4xl mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Welcome to the Blog Community{username ? `, ${username}` : ''}!</h2>
      <p className="text-gray-600 mb-4">Get started by following other users or creating your first blog.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          Create Blog
        </button>
        <button
          onClick={() => navigate('/users')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Find Users to Follow
        </button>
      </div>
    </div>
  );
};

export default BlogList;
