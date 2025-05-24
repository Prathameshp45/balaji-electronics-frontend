import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`logo flex items-center justify-center p-1 ${className || ''}`}>
      <img 
        src="https://t4.ftcdn.net/jpg/11/28/41/63/360_F_1128416304_7TCfTn4uXpLQ2pN4SJfz4a26g63NIgCJ.jpg" 
        alt="Balaji Electronics" 
        className="object-contain rounded-lg w-full h-full"
        style={{
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export default Logo;