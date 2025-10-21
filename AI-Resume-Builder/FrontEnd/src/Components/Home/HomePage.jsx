import React, { useRef } from "react";
import LiquidEther from './LiquidEther';
import Hero from './Header';
import CircularGallery from './CircularGallery';
import Features from './Features';
import TrustedBy from './TrustedBy';

export default function Home() {
  const examplesSectionRef = useRef(null);


  const scrollToExamples = () => {
    examplesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section with LiquidEther background */}
      <header className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B19EEF']}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={0}
            autoRampDuration={0.6}
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <div className="relative z-10">
          <Hero scrollToSection={scrollToExamples} />
        </div>
      </header>

      {/* Examples Section */}
      <section ref={examplesSectionRef} className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-white">
            Stunning Resumes, Effortlessly Created
          </h2>
          <div className="w-full h-[500px]">
            <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Trusted By Section */}
      <TrustedBy />

      {/* Footer */}
      <footer className="py-12 bg-black text-center text-gray-400">
        <p>© 2025 AI Resume Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
