import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-card rounded-lg border border-border-color shadow-sm ${className}`}>
      {title && (
        <div className="px-4 py-4 border-b border-border-color sm:px-6">
          <h3 className="text-lg leading-6 font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;