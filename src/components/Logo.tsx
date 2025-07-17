import React from 'react';

const Logo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  size = 'lg' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-15 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <img
        src="/LOGO_wname_VOV-removebg-preview.png"
        alt="VovZone Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;