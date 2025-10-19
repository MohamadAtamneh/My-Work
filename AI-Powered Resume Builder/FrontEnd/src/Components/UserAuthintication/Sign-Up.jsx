import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/Logo.png"; // corrected case
import signUpImage from "../../assets/SignUp.png"; // Import the background image
import manAvatar from "../../assets/man.png";
import womanAvatar from "../../assets/woman.png";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("other");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const navigate = useNavigate();

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      let photo = '';
      if (photoFile) {
        photo = await toBase64(photoFile);
      }

      await axios.post("http://localhost:3000/api/users/register", {
        fullName: name,
        email,
        password,
        gender,
        photo
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Image */}
      <div
        className="w-1/2 hidden md:block bg-cover bg-center"
        style={{ backgroundImage: `url(${signUpImage})` }}
      />

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-900/90">
        <div className="w-full max-w-md p-8">
          <Link to="/" className="mb-8 mx-auto flex justify-center">
            <img src={logo} alt="ResuAI Logo" className="h-30 w-auto cursor-pointer" />
          </Link>

          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
          <p className="text-gray-300 mb-8 text-center">Sign up to start building your AI Resume</p>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label className="block text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Gender</label>
              <select
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                <span>Default avatar if no photo:</span>
                <img src={manAvatar} alt="Male" className="h-6 w-6 rounded-full" />
                <img src={womanAvatar} alt="Female" className="h-6 w-6 rounded-full" />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-gray-300"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPhotoFile(file || null);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPhotoPreview(url);
                  } else {
                    setPhotoPreview("");
                  }
                }}
              />
              {photoPreview && (
                <div className="mt-2">
                  <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold"
            >
              Sign Up
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Already have an account? <Link to="/login" className="text-purple-500 hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
