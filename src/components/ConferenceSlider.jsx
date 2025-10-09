import { useState, useEffect } from 'react';

function ConferenceSlider({ value, onChange }) {
  const [position, setPosition] = useState(1); // 0 = West, 1 = Both, 2 = East

  // Map value to position
  useEffect(() => {
    if (value === 'west') setPosition(0);
    else if (value === 'both') setPosition(1);
    else if (value === 'east') setPosition(2);
  }, [value]);

  const handleClick = (newPosition) => {
    setPosition(newPosition);
    if (newPosition === 0) onChange('west');
    else if (newPosition === 1) onChange('both');
    else if (newPosition === 2) onChange('east');
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {/* Slider Track */}
      <div className="relative w-full max-w-md h-16 bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-full border-2 border-white/10 shadow-2xl backdrop-blur-sm">
        {/* Background gradient indicator */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className={`absolute inset-y-0 transition-all duration-500 ease-out ${
            position === 0 ? 'left-0 w-1/3 bg-gradient-to-r from-orange-500/30 to-orange-600/20' :
            position === 1 ? 'left-1/3 w-1/3 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/20' :
            'left-2/3 w-1/3 bg-gradient-to-r from-blue-500/30 to-blue-600/20'
          }`}></div>
        </div>

        {/* Slider Button */}
        <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
          position === 0 ? 'left-2' :
          position === 1 ? 'left-1/2 -translate-x-1/2' :
          'right-2'
        }`}>
          <div className={`relative w-24 h-12 rounded-full shadow-2xl transition-all duration-500 ${
            position === 0 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
            position === 1 ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500' :
            'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}>
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse ${
              position === 0 ? 'bg-orange-500' :
              position === 1 ? 'bg-purple-500' :
              'bg-blue-500'
            }`}></div>

            {/* Icon/Label */}
            <div className="relative z-10 w-full h-full flex items-center justify-center text-white font-bold text-xs tracking-wider">
              {position === 0 ? '🟠 WEST' :
               position === 1 ? 'ALL' :
               '🔵 EAST'}
            </div>
          </div>
        </div>

        {/* Click zones */}
        <button
          onClick={() => handleClick(0)}
          className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
          aria-label="West Conference"
        />
        <button
          onClick={() => handleClick(1)}
          className="absolute left-1/3 top-0 w-1/3 h-full cursor-pointer z-10"
          aria-label="Both Conferences"
        />
        <button
          onClick={() => handleClick(2)}
          className="absolute left-2/3 top-0 w-1/3 h-full cursor-pointer z-10"
          aria-label="East Conference"
        />
      </div>

      {/* Labels below slider */}
      <div className="flex justify-between w-full max-w-md px-4">
        <div className={`text-xs font-semibold transition-all duration-300 ${
          position === 0 ? 'text-orange-400 scale-110' : 'text-gray-500'
        }`}>
          🟠 WEST
        </div>
        <div className={`text-xs font-semibold transition-all duration-300 ${
          position === 1 ? 'text-purple-400 scale-110' : 'text-gray-500'
        }`}>
          ALL CONFERENCES
        </div>
        <div className={`text-xs font-semibold transition-all duration-300 ${
          position === 2 ? 'text-blue-400 scale-110' : 'text-gray-500'
        }`}>
          🔵 EAST
        </div>
      </div>
    </div>
  );
}

export default ConferenceSlider;
