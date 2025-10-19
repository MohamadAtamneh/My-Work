import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero({ scrollToSection }) {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-center text-center h-screen z-20 text-white px-6">
      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
        Build Your Resume with <span className="text-purple-400">AI</span> in Seconds
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
        Let AI craft a professional, job-ready resume tailored to your career goals.
      </p>

      {/* Call-to-Action Buttons */}
      <div className="flex gap-4">
        <button
          className="
            rounded-full
            px-6 py-3
            font-extrabold
            text-white
            bg-purple-600/30
            backdrop-blur-sm
            border border-purple-500/30
            hover:bg-purple-600/40
            hover:border-purple-500/50
            transition
            duration-300
          "
          onClick={() => navigate("/Login")}
        >
          🚀 Get Started
        </button>


          <button
            className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold shadow-lg backdrop-blur-sm transition"
            onClick={scrollToSection}
          >
            👀 See Examples
          </button>

      </div>
    </section>
  );
}
