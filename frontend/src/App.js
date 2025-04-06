import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import BlogList from "./components/BlogList";
import CreateBlog from "./components/CreateBlog";
import Profile from "./components/Profile";
import Users from "./components/Users";
import HomePage from "./components/HomePage";
import ActivityFeed from "./components/ActivityFeed";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  console.log("ProtectedRoute isAuthenticated:", isAuthenticated);
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  console.log("PublicRoute isAuthenticated:", isAuthenticated);
  
  return isAuthenticated ? <Navigate to="/blogs" /> : children;
}

const token = localStorage.getItem("authToken");

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-200">
          <Navbar />
          <div className="container mx-auto p-4">
            <Routes>
              <Route
                path="/"
                element={
                  <Navigate
                    to={localStorage.getItem("authToken") ? "/blogs" : "/login"}
                    replace
                  />
                }
              />
              {/* Protect auth routes from authenticated users */}

              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                   </PublicRoute>
                }
              />

              {/* Rest of your protected routes */}
              <Route
                path="/blogs"
                element={
                  <ProtectedRoute>
                    <BlogList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homepage"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities"
                element={
                  <ProtectedRoute>
                    <ActivityFeed />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
