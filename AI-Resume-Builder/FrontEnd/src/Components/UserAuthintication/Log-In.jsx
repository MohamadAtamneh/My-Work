import { useContext } from "react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import logo from "../../assets/logo.png"; // adjust path
import loginImage from "../../assets/LogIn.png"; // Import the background image
import avatar from "../../assets/man.png"; // Import the avatar image

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
   const [photo, setPhoto] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/users/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token); // save token
      // Fetch full user info
      const userRes = await axios.get("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data); // set user in context
      navigate("/Dashboard"); // redirect to Job Tracker
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };
  

  return (
    <div className="flex min-h-screen">
      {/* Left: Image */}
      <div
        className="w-1/2 hidden md:block bg-cover bg-center"
        style={{ backgroundImage: `url(${loginImage})` }} // Use the imported variable
      />

      {/* Right: Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-900/90">
        <Link to="/" className="mb-8">
          <img src={logo} alt="ResuAI Logo" className="h-30 w-auto cursor-pointer" />
        </Link>

        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          <p className="text-gray-300 mb-8 text-center">Login to access your dashboard</p>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="********"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold"
            >
              Log In
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Don't have an account? <Link to="/register" className="text-purple-500 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
