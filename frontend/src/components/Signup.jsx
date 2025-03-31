import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    isPrivate: false,
  });

  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const response = await axios.post("http://localhost:4000/signup", formData, {
        withCredentials: true,
      });
      alert(response.data.message); // Show success message
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.log(error)
      setError(error.response?.data?.message || "Signup failed. Please try again."); // Show error message
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-center text-gray-600 mt-2">Join us and start your journey today!</p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* Display error message */}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-600">Private Account</label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-lg font-semibold text-white shadow-md hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;