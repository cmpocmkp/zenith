import React from 'react';
import { NavLink } from 'react-router-dom';

// FIX: Replaced JSX.Element with React.ReactElement to resolve 'Cannot find namespace 'JSX'' error.
const NavItem: React.FC<{ to: string; icon: React.ReactElement; label: string }> = ({ to, icon, label }) => {
  const activeClass = 'bg-primary text-white';
  const inactiveClass = 'text-gray-300 hover:bg-sidebar-hover hover:text-white';
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {React.cloneElement(icon, { className: "h-6 w-6" })}
      <span className="ml-3">{label}</span>
    </NavLink>
  );
};


const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-sidebar">
          <svg className="h-8 w-auto text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-white text-2xl font-semibold ml-2">MYA</span>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto bg-sidebar p-4">
          <nav className="flex-1 space-y-2">
             <NavItem 
                to="/dashboard"
                label="Dashboard"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>}
              />
            <NavItem
              to="/accounts"
              label="Accounts"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-6 2.25h6M3.75 16.5h16.5v-6.75A3.375 3.375 0 0016.5 6.375h-1.5-1.5a3.375 3.375 0 00-3.375 3.375v6.75z" /></svg>}
            />
            <NavItem
              to="/transactions/new"
              label="New Transaction"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
             <NavItem
              to="/budget"
              label="Budget"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>}
            />
             <NavItem
              to="/reports"
              label="Reports"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M16.5 3.75h.008v.008H16.5V3.75z" /></svg>}
            />
             <NavItem
              to="/settings"
              label="Settings"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.595.053 1.022.574 1.022 1.178v.043a5.58 5.58 0 011.137.522c.24.11.453.245.638.395.184.15.345.32.483.498.138.178.255.37.348.572.094.202.164.418.21.642a5.58 5.58 0 010 .848c-.046.224-.116.44-.21.642-.093.202-.21.394-.348.572a5.58 5.58 0 01-.483.498c-.185.15-.398.285-.638.395a5.58 5.58 0 01-1.137.522v.043c0 .604-.427 1.125-1.022 1.178-.55.048-1.02-.408-1.11-.95a5.58 5.58 0 01-.522-1.137c-.11-.24-.245-.453-.395-.638a5.58 5.58 0 01-.498-.483c-.178-.138-.37-.255-.572-.348-.202-.094-.418-.164-.642-.21a5.58 5.58 0 01-.848 0c-.224.046-.44.116-.642.21-.202.093-.394.21-.572.348a5.58 5.58 0 01-.498.483c-.15.185-.285.398-.395.638a5.58 5.58 0 01-.522 1.137c-.09.542-.56 1.007-1.11.95-.595-.053-1.022-.574-1.022-1.178v-.043a5.58 5.58 0 01-1.137-.522c-.24-.11-.453-.245-.638-.395a5.58 5.58 0 01-.483-.498c-.138-.178-.255-.37-.348-.572-.094-.202-.164-.418-.21-.642a5.58 5.58 0 010-.848c.046-.224.116-.44.21-.642.093-.202.21-.394.348-.572a5.58 5.58 0 01.483-.498c.185-.15.398-.285.638-.395a5.58 5.58 0 011.137-.522v-.043c0-.604.427-1.125 1.022-1.178.55-.048 1.02.408 1.11.95z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;