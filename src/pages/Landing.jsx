import "../index.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden z-[1]" style={{
      background: `
        radial-gradient(ellipse at top, #1e3a8a 0%, #1e1b4b 25%, #0f172a 60%, #000000 100%),
        radial-gradient(ellipse at bottom right, #312e81 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, #1e40af 0%, transparent 50%)
      `
    }}>
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {/* Large bright stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#ffffff',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
        
        {/* Medium stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={`star-med-${i}`}
            className="absolute rounded-full"
            style={{
              width: '1px',
              height: '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#e0e7ff',
              boxShadow: '0 0 3px rgba(224, 231, 255, 0.6)',
            }}
          />
        ))}
        
        {/* Small distant stars */}
        {[...Array(150)].map((_, i) => (
          <div
            key={`star-small-${i}`}
            className="absolute rounded-full"
            style={{
              width: '0.5px',
              height: '0.5px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#cbd5e1',
              opacity: 0.7,
            }}
          />
        ))}

        {/* Distant galaxies/nebulae */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`nebula-${i}`}
            className="absolute rounded-full animate-pulse opacity-20"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${50 + Math.random() * 100}px`,
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
              background: `radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 40%, transparent 70%)`,
              filter: 'blur(20px)',
              animationDuration: `${8 + Math.random() * 6}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}

        {/* Cosmic dust clouds */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute animate-float opacity-10"
            style={{
              width: `${200 + Math.random() * 300}px`,
              height: `${100 + Math.random() * 150}px`,
              left: `${Math.random() * 60}%`,
              top: `${Math.random() * 70}%`,
              background: `radial-gradient(ellipse, rgba(30, 58, 138, 0.4) 0%, rgba(30, 27, 75, 0.3) 30%, transparent 60%)`,
              filter: 'blur(40px)',
              animationDuration: `${20 + Math.random() * 30}s`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
        ))}
      </div>

      {/* Cosmic Energy Streams */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Bright cosmic streams */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-20 animate-data-stream opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              background: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.8), transparent)',
              boxShadow: '0 0 4px rgba(59, 130, 246, 0.6)',
            }}
          />
        ))}
        
        {/* Stellar wind streams */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute w-px h-32 animate-data-stream opacity-25"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
              background: 'linear-gradient(to bottom, transparent, rgba(147, 197, 253, 0.7), transparent)',
              boxShadow: '0 0 3px rgba(147, 197, 253, 0.4)',
            }}
          />
        ))}
        
        {/* Cosmic dust trails */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`sliver-${i}`}
            className="absolute w-px h-40 animate-data-stream opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${10 + Math.random() * 12}s`,
              background: 'linear-gradient(to bottom, transparent, rgba(191, 219, 254, 0.6), transparent)',
              boxShadow: '0 0 2px rgba(191, 219, 254, 0.3)',
            }}
          />
        ))}
      </div>

      {/* Floating Glass Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating glass orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute glass rounded-full animate-float opacity-20 shadow-luxury"
            style={{
              width: `${60 + Math.random() * 80}px`,
              height: `${60 + Math.random() * 80}px`,
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${26 + Math.random() * 14}s`,
            }}
          />
        ))}
        
        {/* Medium floating glass rectangles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`rect-${i}`}
            className="absolute glass-dark rounded-xl animate-float opacity-15 border border-white/20"
            style={{
              width: `${40 + Math.random() * 60}px`,
              height: `${30 + Math.random() * 40}px`,
              left: `${Math.random() * 85}%`,
              top: `${Math.random() * 85}%`,
              animationDelay: `${Math.random() * 26}s`,
              animationDuration: `${20 + Math.random() * 20}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
        
        {/* Small floating glass diamonds */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`diamond-${i}`}
            className="absolute glass rounded-lg animate-float opacity-25 border border-blue-400/30"
            style={{
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              left: `${Math.random() * 95}%`,
              top: `${Math.random() * 95}%`,
              animationDelay: `${Math.random() * 33}s`,
              animationDuration: `${13 + Math.random() * 27}s`,
              transform: `rotate(45deg)`,
            }}
          />
        ))}
        
        {/* Glass hexagons with glow */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`hex-${i}`}
            className="absolute animate-float opacity-30"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${Math.random() * 40}s`,
              animationDuration: `${33 + Math.random() * 20}s`,
            }}
          >
            <div 
              className="glass-dark border border-purple-400/40 shadow-executive animate-glow-pulse"
              style={{
                width: `${50 + Math.random() * 40}px`,
                height: `${50 + Math.random() * 40}px`,
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
              }}
            />
          </div>
        ))}
        
        {/* Floating glass particles with trails */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute animate-data-stream opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 50}s`,
              animationDuration: `${26 + Math.random() * 40}s`,
            }}
          >
            <div className="w-1 h-8 bg-gradient-to-b from-transparent via-cyan-400 to-transparent glass rounded-full" />
          </div>
        ))}
        
        {/* Large floating glass panels */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`panel-${i}`}
            className="absolute glass-dark border border-white/10 rounded-2xl animate-float opacity-10 shadow-luxury"
            style={{
              width: `${120 + Math.random() * 100}px`,
              height: `${80 + Math.random() * 60}px`,
              left: `${Math.random() * 70}%`,
              top: `${Math.random() * 80}%`,
              animationDelay: `${Math.random() * 66}s`,
              animationDuration: `${50 + Math.random() * 33}s`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
            }}
          >
            <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-glow-pulse" />
          </div>
        ))}
      </div>


      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center w-full h-full spacing-container">
        <div className={`text-center max-w-7xl mx-auto px-4 ${isLoaded ? 'animate-luxury-fade-in' : 'opacity-0'}`}>
          
          {/* Modern Header Section */}
          <div className="mb-16 relative">
            <div className="relative text-center space-y-4">
              <div className="inline-block">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-wider text-white leading-none">
                  ROCKET
                </h1>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent mt-2 mb-2" />
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-wider text-white leading-none">
                  LEAGUE
                </h1>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400" />
                <span className="text-lg sm:text-xl md:text-2xl font-light tracking-widest text-blue-300 uppercase">
                  Beer League
                </span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400" />
              </div>
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
              className="group spacing-container bg-gray-800/90 text-white font-semibold text-lg rounded-full transition-smooth hover:shadow-executive"
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
          <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 max-w-4xl mx-auto px-4">
            <div className="bg-gray-800/90 rounded-2xl px-6 py-4 w-full sm:w-auto text-center">
              <div className="text-3xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
            <div className="bg-gray-800/90 rounded-2xl px-6 py-4 w-full sm:w-auto text-center">
              <div className="text-3xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-300">Monitoring</div>
            </div>
            <div className="bg-gray-800/90 rounded-2xl px-6 py-4 w-full sm:w-auto text-center">
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
