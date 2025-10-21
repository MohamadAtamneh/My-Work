import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero({ scrollToSection }) {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center text-center h-screen z-10 text-white px-6 pointer-events-none">
      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 pointer-events-auto">
        Build Your Future with an AI-Powered Resume
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl mb-8 max-w-3xl text-gray-300 drop-shadow-md pointer-events-auto">
        Craft a professional, job-winning resume in minutes. Our AI helps you stand out and land your dream job.
      </p>

      {/* Call-to-Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
        <button
          className="
            rounded-full
            px-8 py-4
            font-extrabold
            text-white
            bg-purple-600
            hover:bg-purple-700
            transition
            duration-300
            transform
            hover:scale-105
            shadow-lg
          "
          onClick={() => navigate("/Login")}
        >
          🚀 Get Started for Free
        </button>
        <button
          className="
            rounded-full
            px-8 py-4
            font-semibold
            text-white
            bg-gray-700/50
            backdrop-blur-sm
            border border-gray-600
            hover:bg-gray-600/70
            transition
            duration-300
          "
          onClick={scrollToSection}
        >
          👀 See Examples
        </button>
      </div>
    </section>
  );
}
