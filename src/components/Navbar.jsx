import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  DashboardIcon, 
  TrophyIcon, 
  SoccerIcon, 
  ChartUpIcon, 
  ChartBarIcon, 
  CalendarIcon, 
  BuildingIcon 
} from "./Icons";

function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (isHome) return null;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark shadow-executive transition-smooth">
      <div className="max-w-7xl mx-auto spacing-container">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section - Hidden on mobile */}
          <Link to="/leagueinfo" className="hidden md:flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-luxury group-hover:animate-glow-pulse">
              <img 
                src="/assets/images/rlbl-logo.jpg" 
                alt="RLBL Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block">
              <div className="text-xl font-bold holographic">RLBL</div>
              <div className="text-xs text-gray-400 -mt-1">Rocket League</div>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {[
              { label: "Dashboard", path: "/leagueinfo", IconComponent: DashboardIcon },
              { label: "Standings", path: "/standings", IconComponent: TrophyIcon },
              { label: "Teams", path: "/teams", IconComponent: SoccerIcon },
              { label: "Weekly", path: "/power-rankings", IconComponent: ChartUpIcon },
              { label: "Statistics", path: "/stats", IconComponent: ChartBarIcon },
              { label: "Schedule", path: "/schedule", IconComponent: CalendarIcon },
              { label: "Legacy", path: "/legacy", IconComponent: BuildingIcon }
            ].map(({ label, path, IconComponent }) => (
              <Link
                key={path}
                to={path}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-fast hover:bg-white/10 hover-gentle ${
                  location.pathname === path 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4 group-hover:animate-float" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button - Centered on mobile */}
          <div className="md:hidden flex-1 flex justify-center">
            <button 
              onClick={toggleMobileMenu}
              className="relative z-50 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-fast flex items-center justify-center gap-2 touch-manipulation min-h-[48px] w-auto"
              aria-label="Toggle navigation menu"
            >
              <span className="text-white font-medium text-lg pointer-events-none">Menu</span>
              <div className="w-5 h-5 relative flex-shrink-0 pointer-events-none">
                <div className={`absolute top-1 left-0 w-full h-0.5 bg-white transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'
                }`}></div>
                <div className={`absolute top-2.5 left-0 w-full h-0.5 bg-white transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></div>
                <div className={`absolute top-4 left-0 w-full h-0.5 bg-white transform transition duration-300 ease-in-out ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'
                }`}></div>
              </div>
            </button>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 spacing-compact rounded-full glass text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-glow-pulse"></div>
              <span className="text-green-400 font-medium">Live</span>
            </div>

            {/* Admin Access */}
            <Link
              to="/admin"
              className="group relative z-10 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-luxury hover-luxury flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:animate-ai-processing flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline text-sm">Admin</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 mobile-menu-backdrop z-40 animate-luxury-fade-in" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-20 left-0 right-0 z-50 mobile-menu-panel border-b border-white/10 transform transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto spacing-container">
          <div className="flex flex-col space-y-1 py-4">
            {[
              { label: "Dashboard", path: "/leagueinfo", IconComponent: DashboardIcon },
              { label: "Standings", path: "/standings", IconComponent: TrophyIcon },
              { label: "Teams", path: "/teams", IconComponent: SoccerIcon },
              { label: "Weekly", path: "/power-rankings", IconComponent: ChartUpIcon },
              { label: "Statistics", path: "/stats", IconComponent: ChartBarIcon },
              { label: "Schedule", path: "/schedule", IconComponent: CalendarIcon },
              { label: "Legacy", path: "/legacy", IconComponent: BuildingIcon }
            ].map(({ label, path, IconComponent }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMobileMenu}
                className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-fast hover:bg-white/10 hover-gentle ${
                  location.pathname === path 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <IconComponent className="w-6 h-6 group-hover:animate-float" />
                <span className="text-lg font-medium">{label}</span>
              </Link>
            ))}
            
            {/* Mobile Admin Link */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3"></div>
            <Link
              to="/admin"
              onClick={closeMobileMenu}
              className="group flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-luxury hover-luxury"
            >
              <svg className="w-6 h-6 group-hover:animate-ai-processing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;