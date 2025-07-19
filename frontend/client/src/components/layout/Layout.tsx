import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showFooter = true,
  title 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900">
      <Navbar title={title} />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
