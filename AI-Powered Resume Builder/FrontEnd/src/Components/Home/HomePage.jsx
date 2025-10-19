import React from "react";
import HomePage from './LiquidEther';
import Hero from './Header';

export default function Home() {
  return (
    <div className="h-screen text-white">
      {/* Hero Section */}
      <div className="h-screen snap-start relative">
        <HomePage
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-auto">
          <Hero />
        </div>
      </div>

      {/* Footer */}
      <footer className="h-screen snap-start flex items-center justify-center bg-purple-800/50 text-white">
        <p>© 2025 AI Resume Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
