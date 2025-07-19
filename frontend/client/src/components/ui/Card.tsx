import React from 'react';
import { cn } from '@shared/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('border-b border-gray-200 pb-4 mb-4', className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className, 
  as: Component = 'h3' 
}) => (
  <Component className={cn('text-lg font-semibold text-gray-900', className)}>
    {children}
  </Component>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('text-gray-600', className)}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('border-t border-gray-200 pt-4 mt-4', className)}>
    {children}
  </div>
);

export default Card;
export { CardHeader, CardTitle, CardContent, CardFooter };
