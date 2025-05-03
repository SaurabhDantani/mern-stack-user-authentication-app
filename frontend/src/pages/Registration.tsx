import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../apis";
import { useNavigate } from "react-router-dom";

export default function RegistrationForm() {
  const [activeTab, setActiveTab] = useState("user"); // "admin" or "user"
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: activeTab === "admin" ? 1 : 2,
  });

  const handleTabSwitch = (tab: any) => {
    setActiveTab(tab);
    setFormData({ ...formData, role: tab === "admin" ? 1 : 2 });
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await axios.post(api.registration, formData)
      console.log(res.data);
      if (res.status === 200) {
        toast.success(res.data.message || "Registration successful!");
        // Redirect or perform any other action
      } else if (res.status === 409) {
        toast.warning(res.data.message || "Email Exis!");
      }
    } catch (error) {
      toast.error("Internal server error!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register Now
        </h2>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => handleTabSwitch("admin")}
            className={`px-4 py-2 rounded-l-lg transition-all ${activeTab === "admin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Register as Admin
          </button>
          <button
            onClick={() => handleTabSwitch("user")}
            className={`px-4 py-2 rounded-r-lg transition-all ${activeTab === "user"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Register as User
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Hidden Role Field */}
          <input type="hidden" name="role" value={formData.role} />

          {/* Submit Button */}
          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold shadow-md hover:from-indigo-600 hover:to-purple-700 transition duration-300 transform hover:scale-105"
            >
              Register
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white text-indigo-600 border border-indigo-600 py-3 px-6 rounded-lg font-semibold shadow-md hover:bg-indigo-50 transition duration-300 transform hover:scale-105"
            >
              Login
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}