import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hyperspeed from '../blocks/Backgrounds/Hyperspeed/Hyperspeed';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome{username ? `, ${username}` : ''}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Share your thoughts, connect with others, and explore amazing content.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/create')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Blog
            </button>
            
            <button
              onClick={() => navigate('/users')}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Users
            </button>
          </div>

          <div className="mt-8 p-6 bg-gray-50/80 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Start Guide</h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Follow other users to see their blogs
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Create your first blog post
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Interact with others through likes and comments
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;