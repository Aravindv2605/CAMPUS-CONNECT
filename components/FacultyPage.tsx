
import React, { useState } from 'react';
import { User } from '../types';
import Header from './Header';
import FacultyDashboard from './FacultyDashboard';
import FacultyEscalationsPage from './FacultyEscalationsPage';
import KnowledgeBasePage from './KnowledgeBasePage';
import StudentRecordsPage from './StudentRecordsPage';
import AIQueriesPage from './AIQueriesPage';

interface FacultyPageProps {
  user: User;
  onLogout: () => void;
}

// Icons for sidebar
const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const EscalationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const KnowledgeBaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);
const StudentsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


const FacultyPage: React.FC<FacultyPageProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const facultyPages: { [key: string]: { component: React.ReactNode, icon: React.ReactNode } } = {
    'Dashboard': { component: <FacultyDashboard setActivePage={setActivePage} />, icon: <DashboardIcon className="w-5 h-5"/> },
    'Escalations': { component: <FacultyEscalationsPage />, icon: <EscalationIcon className="w-5 h-5"/> },
    'Knowledge Base': { component: <KnowledgeBasePage />, icon: <KnowledgeBaseIcon className="w-5 h-5"/> },
    'Student Records': { component: <StudentRecordsPage />, icon: <StudentsIcon className="w-5 h-5"/> },
    'AI Query History': { component: <AIQueriesPage />, icon: <HistoryIcon className="w-5 h-5"/> },
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
  }

  return (
    <div className="flex flex-col h-screen bg-[#21243d] text-gray-200">
      <Header 
        user={user} 
        onProfileClick={() => {}} 
        pageTitle={activePage} 
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
            <div 
                onClick={() => setSidebarOpen(false)} 
                className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            ></div>
        )}
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1c36] p-6 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-600 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <h2 className="text-xl font-bold text-white">CampusConnect</h2>
          </div>
          <nav className="flex-1">
            <ul>
              {Object.entries(facultyPages).map(([name, { icon }]) => (
                <li key={name} className="mb-2">
                  <button
                    onClick={() => handlePageChange(name)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-3 ${activePage === name ? 'bg-fuchsia-600 text-white' : 'hover:bg-gray-700/50'}`}
                  >
                    {icon}
                    <span>{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-700/50">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
           {facultyPages[activePage].component}
        </main>
      </div>
    </div>
  );
};

export default FacultyPage;
