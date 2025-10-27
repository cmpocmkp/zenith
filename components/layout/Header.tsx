import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const getTitle = () => {
    const pathSegments = location.pathname.split('/');
    const mainPath = pathSegments[1];
    
    switch (mainPath) {
      case 'dashboard':
        return 'Dashboard';
      case 'accounts':
        if (pathSegments.length > 2) {
           if(pathSegments[2] === 'new') return 'New Account';
           return pathSegments[3] === 'edit' ? 'Edit Account' : 'Account Register';
        }
        return 'Chart of Accounts';
      case 'transactions':
        return 'New Transaction';
      case 'reports':
        return 'Financial Reports';
      case 'budget':
        return 'Budget Planning';
      case 'settings':
        return 'Settings';
      default:
        return 'MYA Ledger';
    }
  };

  return (
    <header className="bg-card border-b border-border-color z-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-semibold text-text-main">{getTitle()}</h1>
          <button
            onClick={logout}
            className="flex items-center text-sm font-medium text-text-light hover:text-primary focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;