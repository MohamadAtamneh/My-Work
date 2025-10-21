import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/Logo.png"; // corrected case
import signUpImage from "../../assets/SignUp.png"; // Import the background image
// Import the modal and verification components
import Modal from "./Modal.jsx";
import VerifyEmailContent from "./VerifyEmailPage.jsx";
import manAvatar from "../../assets/man.png";
import womanAvatar from "../../assets/woman.png";
import { UserContext } from "../../Context/UserContext";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("other");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // State for the verification modal
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
  const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|io|co\.il|gov|edu|me|tech)$/i;
    return emailRegex.test(email);
  };
  const isValidPassword = (password) => {
  // Must be at least 8 characters, include uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //return passwordRegex.test(password);
  return true;
};




  const handleSignUp = async (e) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setError("");
    try {
      let photo = '';
      if (photoFile) {
        photo = await toBase64(photoFile);
      }
      if (!isValidEmailFormat(email)) {
        throw new Error('Invalid email format');
      }
      if (!isValidPassword(password)) {
        throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      }

      await axios.post("http://localhost:3000/api/users/register", {
        fullName: name,
        email,
        password,
        gender,
        photo
      });
      // On success, open the modal instead of navigating
      setEmailToVerify(email);
      setVerificationModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Modal isOpen={isVerificationModalOpen} onClose={() => setVerificationModalOpen(false)}>
        <VerifyEmailContent
          email={emailToVerify}
          onClose={() => setVerificationModalOpen(false)}
          setUser={setUser}
        />
      </Modal>

      <div className="flex min-h-screen w-full">
        {/* Left: Image */}
        {<div
          className="w-1/2 hidden md:block bg-cover bg-center"
          style={{ backgroundImage: `url(${signUpImage})` }}
        />
        }
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setName(value);
                    if (!value) {
                      setNameError("Name is required");
                    } else {
                      setNameError("");
                    }
                  }}
                  required
                />
                 {nameError && (
                  <p className="text-red-500 text-sm mt-1">{nameError}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    if (!value) {
                      setEmailError("Email is required");
                    } else if (!isValidEmailFormat(value)) {
                      setEmailError("Invalid email format");
                    } else {
                      setEmailError("");
                    }
                  }}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    if (!value) {
                      setPasswordError("Password is required");
                    } else if (!isValidPassword(value)) {
                      setPasswordError("Password must be 8+ characters and include uppercase, lowercase, a number, and a special character.");
                    } else {
                      setPasswordError("");
                    }
                  }}
                  required
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
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
    </div>
  );
}
