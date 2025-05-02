# BlogBonds - Social Blogging Platform

A full-stack social blogging platform that empowers users to write blogs, share them publicly or privately, engage with other bloggers through likes, comments, and follows, and build a personalized blogging network.

## 🌟 Features

### 🔐 Authentication & Authorization
- Secure user registration and login
- JWT-based authentication
- Role-based access (User/Admin)
- Protected routes for authenticated users
- Support for public and private user accounts

### 📝 Blog Management
- Create, edit, and delete blog posts with rich text and image support
- Upload and optimize images via Cloudinary
- Like and unlike posts
- Comment system with real-time updates
- Infinite scroll feed for seamless blog discovery

### 👥 Social Features
- Follow/Unfollow users
- Real-time notifications (likes, comments, follows)
- Private account handling (follow request system)
- View followers and following lists
- User search with filters
- Activity feed for social interactions

### 👤 Profile Management
- Personalized profiles with user stats (posts, followers, following)
- View own posts and activity history
- Update profile information
- Handle follow requests (accept/reject)

### 💅 UI/UX Features
- Fully responsive and mobile-friendly design
- Modern UI with TailwindCSS
- Image preview before upload
- Toast notifications for user feedback
- Loading states and error boundaries
- Smooth animations and transitions

## 🔧 Tech Stack

### Frontend
- React.js with functional components
- React Router for navigation
- Axios for API communication
- Context API for global state management
- TailwindCSS for styling
- date-fns for date formatting

### Backend
- Node.js with Express.js
- MongoDB + Mongoose for database
- JWT for user authentication
- Redis for caching and real-time feeds
- Cloudinary for media storage
- Multer for image upload handling
- Bcrypt for password encryption

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB (local or cloud instance)
- Redis server running locally or via cloud
- Cloudinary account and API credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/blogbonds.git
cd blogbonds
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
Create a .env file in the backend/ directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
REDIS_URL=your_redis_url_or_localhost
```

4. Run the backend server
```bash
npm run dev
```

5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

6. Start the frontend development server
```bash
npm start
```

## 🛠️ Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch
```bash
git checkout -b feature/awesome-feature
```
3. Commit your changes
```bash
git commit -m 'Add some awesome feature'
```
4. Push to the branch
```bash
git push origin feature/awesome-feature
```
5. Open a pull request



## 🤝 Acknowledgments
- Create React App
- TailwindCSS
- MongoDB
- Express.js
- Node.js community


