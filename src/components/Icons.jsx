// Professional SVG Icons for RLBL Application
import React from 'react';

// Base icon component with consistent styling
const BaseIcon = ({ children, className = "w-5 h-5", color = "currentColor", ...props }) => (
  <svg 
    className={className} 
    fill={color} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {children}
  </svg>
);

// Dashboard/Analytics Icon
export const DashboardIcon = ({ className, color = "#3B82F6" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </BaseIcon>
);

// Trophy/Standings Icon
export const TrophyIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h1a2 2 0 0 1 2 2v3a3 3 0 0 1-3 3h-.78l-.33 2.142A2 2 0 0 1 14.131 16H9.869a2 2 0 0 1-1.738-2.858L7.78 11H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h1zM6 8v1a1 1 0 0 0 1 1h1.22l.44 2.857.001.143h6.668l.44-2.857L16 10h1a1 1 0 0 0 1-1V8H6zm3-4h6v2H9V4z"/>
    <path d="M6 20h12v2H6z"/>
  </BaseIcon>
);

// Soccer Ball/Teams Icon
export const SoccerIcon = ({ className, color = "#10B981" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5l4-6.5 4 6.5H8z" fill={color}/>
    <polygon points="12,6 15.5,9.5 12,13 8.5,9.5" fill="white"/>
  </BaseIcon>
);

// Chart Up/Weekly Rankings Icon
export const ChartUpIcon = ({ className, color = "#8B5CF6" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3" stroke={color} strokeWidth="2" fill="none"/>
    <polyline points="15,9 19,9 19,13" stroke={color} strokeWidth="2" fill="none"/>
  </BaseIcon>
);

// Chart Bar/Statistics Icon
export const ChartBarIcon = ({ className, color = "#EF4444" }) => (
  <BaseIcon className={className} color={color}>
    <rect x="3" y="8" width="4" height="9"/>
    <rect x="10" y="5" width="4" height="12"/>
    <rect x="17" y="2" width="4" height="15"/>
  </BaseIcon>
);

// Calendar/Schedule Icon
export const CalendarIcon = ({ className, color = "#06B6D4" }) => (
  <BaseIcon className={className} color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2"/>
  </BaseIcon>
);

// Building/Legacy Icon
export const BuildingIcon = ({ className, color = "#7C3AED" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M3 21V7l4-4 4 4v14h-8z"/>
    <path d="M13 5v16h8V9l-4-4-4 4z"/>
    <rect x="5" y="10" width="2" height="2"/>
    <rect x="5" y="14" width="2" height="2"/>
    <rect x="15" y="12" width="2" height="2"/>
    <rect x="15" y="16" width="2" height="2"/>
  </BaseIcon>
);

// Star Icon
export const StarIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </BaseIcon>
);

// Medal Icons
export const GoldMedalIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" fill="#FEF3C7"/>
    <path d="M6.09 13.28l3.86 7.71a1 1 0 0 0 1.78 0l3.86-7.71" stroke={color} strokeWidth="2" fill="none"/>
    <text x="12" y="10" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">1</text>
  </BaseIcon>
);

export const SilverMedalIcon = ({ className, color = "#6B7280" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" fill="#F3F4F6"/>
    <path d="M6.09 13.28l3.86 7.71a1 1 0 0 0 1.78 0l3.86-7.71" stroke={color} strokeWidth="2" fill="none"/>
    <text x="12" y="10" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">2</text>
  </BaseIcon>
);

export const BronzeMedalIcon = ({ className, color = "#CD7C2F" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" fill="#FED7AA"/>
    <path d="M6.09 13.28l3.86 7.71a1 1 0 0 0 1.78 0l3.86-7.71" stroke={color} strokeWidth="2" fill="none"/>
    <text x="12" y="10" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">3</text>
  </BaseIcon>
);

// Fire Icon
export const FireIcon = ({ className, color = "#EF4444" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </BaseIcon>
);

// Shield Icon
export const ShieldIcon = ({ className, color = "#3B82F6" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </BaseIcon>
);

// Target Icon
export const TargetIcon = ({ className, color = "#10B981" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </BaseIcon>
);

// Users Icon
export const UsersIcon = ({ className, color = "#8B5CF6" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </BaseIcon>
);

// Rocket Icon
export const RocketIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </BaseIcon>
);

// Document Icon
export const DocumentIcon = ({ className, color = "#6B7280" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </BaseIcon>
);

// Video Icon
export const VideoIcon = ({ className, color = "#EF4444" }) => (
  <BaseIcon className={className} color={color}>
    <polygon points="23,7 16,12 23,17"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
  </BaseIcon>
);

// Stream Icon
export const StreamIcon = ({ className, color = "#9333EA" }) => (
  <BaseIcon className={className} color={color}>
    <rect x="2" y="4" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="11" r="3" fill={color}/>
    <path d="M8.5 8.5l7 5-7 5z" fill="white"/>
  </BaseIcon>
);

// Lightning/Bolt Icon
export const BoltIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  </BaseIcon>
);

// Explosion Icon
export const ExplosionIcon = ({ className, color = "#EF4444" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 21 12 17.77 7.82 21 9 14.14 4 9.27l5.91-1.01L12 2z"/>
    <circle cx="12" cy="12" r="3" fill="white"/>
  </BaseIcon>
);

// Rules/Document Icon
export const RulesIcon = ({ className, color = "#3B82F6" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </BaseIcon>
);

// Medal/Award Icon
export const AwardIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/>
  </BaseIcon>
);

// Flag Icon
export const FlagIcon = ({ className, color = "#EF4444" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </BaseIcon>
);

// Books/Resources Icon
export const BooksIcon = ({ className, color = "#06B6D4" }) => (
  <BaseIcon className={className} color={color}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </BaseIcon>
);

// Crown Icon
export const CrownIcon = ({ className, color = "#F59E0B" }) => (
  <BaseIcon className={className} color={color}>
    <path d="m2 20 8-8 4 4 8-8"/>
    <path d="M5 7 3 3l4 4 4-4 4 4 4-4-2 4"/>
    <path d="M3 20h18"/>
  </BaseIcon>
);

// Chevron Down Icon
export const ChevronDownIcon = ({ className, color = "currentColor" }) => (
  <BaseIcon className={className} color="none">
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
  </BaseIcon>
);