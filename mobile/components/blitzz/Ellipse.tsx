import React from 'react';

interface EllipseProps {
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export const Ellipse: React.FC<EllipseProps> = ({ 
  size = 56,
  color = '#50CAFF',
  className = '',
  onClick
}) => {
  const hoverColor = '#3bb5e6'; // Couleur au survol

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className={`ellipse ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isHovered ? hoverColor : color,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0px 6px 8px 0px rgba(0,0,0,0.2)' 
          : '0px 4px 4px 0px rgba(0,0,0,0.15)'
      }}
    >
      {/* Ellipse vide - pas de contenu */}
    </div>
  );
};

export default Ellipse;
