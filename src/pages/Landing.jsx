import "../index.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-executive">
      {/* Neural Network Background */}
      <div className="absolute inset-0 neural-bg opacity-30">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-neural-network opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Data Streams */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-20 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-data-stream opacity-30"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive Cursor Effect */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-96 h-96 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-glow-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center w-full h-full spacing-container">
        <div className={`text-center max-w-6xl mx-auto ${isLoaded ? 'animate-luxury-fade-in' : 'opacity-0'}`}>
          
          {/* Premium Logo/Title Section */}
          <div className="mb-12 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-liquid-morph" />
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black holographic mb-4 tracking-tight">
                RLBL
              </h1>
              <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6" />
              <h2 className="text-2xl md:text-4xl font-bold text-white/90 tracking-wide">
                ROCKET LEAGUE BEER LEAGUE
              </h2>
            </div>
          </div>

          {/* Premium Description */}
          <div className="glass-dark rounded-3xl p-8 md:p-12 mb-12 shadow-luxury animate-premium-slide-up">
            <p className="text-xl md:text-2xl text-gray-200 font-light leading-relaxed mb-6">
              Dylan Wilding Dylan WildingDylan Wilding Dylan Wilding    Dylan Wilding Dylan Wilding Dylan Wilding Dylan WildingDylan Wilding ylaWildingDyWildinDylanlding
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-300">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Analytics
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                idk what to put here
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                uh doi
              </span>
            </div>
          </div>

          {/* Premium Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-large justify-center items-center">
            <Link
              to="/leagueinfo"
              className="group relative spacing-container bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-luxury hover-luxury"
            >
              <span className="relative z-10 flex items-center gap-standard">
                <svg className="w-6 h-6 group-hover:animate-ai-processing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enter Dashboard
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-smooth" />
            </Link>

            <Link
              to="/legacy"
              className="group spacing-container bg-gray-800/90 border border-gray-500 text-white font-semibold text-lg rounded-full hover:border-blue-400 transition-smooth hover:shadow-executive"
            >
              <span className="flex items-center gap-standard">
                <svg className="w-6 h-6 group-hover:animate-ai-processing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Historical Data
              </span>
            </Link>
          </div>

          {/* Status Indicators */}
          <div className="mt-16 flex justify-center gap-8">
            <div className="bg-gray-800/90 border border-gray-600 rounded-2xl px-6 py-4">
              <div className="text-3xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
            <div className="bg-gray-800/90 border border-gray-600 rounded-2xl px-6 py-4">
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-300">Monitoring</div>
            </div>
            <div className="bg-gray-800/90 border border-gray-600 rounded-2xl px-6 py-4">
              <div className="text-3xl font-bold text-purple-400">Live</div>
              <div className="text-sm text-gray-300">Data Feed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-32 bg-gradient-to-t from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
    </div>
  );
}
