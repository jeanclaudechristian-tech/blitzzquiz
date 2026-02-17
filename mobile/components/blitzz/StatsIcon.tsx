import React from 'react';

interface StatsIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const StatsIcon: React.FC<StatsIconProps> = ({ 
  size = 30,
  color = '#24201d',
  className = '' 
}) => {
  return (
    <div 
      className={`stats-icon ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-block'
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 30 30" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Barre courte (gauche) */}
        <rect 
          x="6" 
          y="16" 
          width="4" 
          height="8" 
          rx="1" 
          fill={color}
        />
        
        {/* Barre moyenne (centre) */}
        <rect 
          x="13" 
          y="11" 
          width="4" 
          height="13" 
          rx="1" 
          fill={color}
        />
        
        {/* Barre grande (droite) */}
        <rect 
          x="20" 
          y="6" 
          width="4" 
          height="18" 
          rx="1" 
          fill={color}
        />
      </svg>
    </div>
  );
};

export default StatsIcon;
