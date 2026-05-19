import React, { useState, useEffect } from 'react';
import { User } from './types';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ChatPage from './components/ChatPage';
import DashboardContent from './components/DashboardContent';
import AssignmentsPage from './components/AssignmentsPage';
import CoursesPage from './components/CoursesPage';
import EventsPage from './components/EventsPage';
import NotificationsPage from './components/NotificationsPage';
import ProfilePage from './components/ProfilePage';
import ResourcesPage from './components/ResourcesPage';
import FacultyPage from './components/FacultyPage';
import { seedDatabaseIfEmpty, createOrUpdateUserProfile } from './services/firebaseService';

// ── Icons ──────────────────────────────────────────────
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CollectionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prefilledQuery, setPrefilledQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatContextToLoad, setChatContextToLoad] = useState<{ question: string; answer: string } | null>(null);
  const [dbReady, setDbReady] = useState(false);

  // Seed database on app load
  useEffect(() => {
    seedDatabaseIfEmpty().finally(() => setDbReady(true));
  }, []);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('campus-connect-user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('campus-connect-user', JSON.stringify(loggedInUser));
    // Save/update user profile in Firestore
    await createOrUpdateUserProfile({
      id: loggedInUser.id,
      name: loggedInUser.name,
      email: loggedInUser.email,
      role: loggedInUser.role,
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('campus-connect-user');
    setActivePage('Dashboard');
  };

  const handleResourceClick = (query: string) => {
    setPrefilledQuery(query);
    setIsChatOpen(true);
  };

  const handleContinueConversation = (question: string, answer: string) => {
    setChatContextToLoad({ question, answer });
    setIsChatOpen(true);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === 'faculty') return <FacultyPage user={user} onLogout={handleLogout} />;

  const studentPages: { [key: string]: { component: React.ReactNode; icon: React.ReactNode } } = {
    'Dashboard': { component: <DashboardContent user={user} />, icon: <HomeIcon className="w-5 h-5" /> },
    'Courses': { component: <CoursesPage />, icon: <BookOpenIcon className="w-5 h-5" /> },
    'Assignments': { component: <AssignmentsPage user={user} />, icon: <ClipboardListIcon className="w-5 h-5" /> },
    'Events': { component: <EventsPage />, icon: <CalendarIcon className="w-5 h-5" /> },
    'Notifications': { component: <NotificationsPage user={user} onContinueConversation={handleContinueConversation} />, icon: <CollectionIcon className="w-5 h-5" /> },
    'Resources': { component: <ResourcesPage onResourceClick={handleResourceClick} />, icon: <CollectionIcon className="w-5 h-5" /> },
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setProfileVisible(false);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#21243d] text-gray-200">
      <Header
        user={user}
        onProfileClick={() => { setProfileVisible(p => !p); setSidebarOpen(false); }}
        pageTitle={isProfileVisible ? 'Profile' : activePage}
        onMenuClick={() => setSidebarOpen(true)}
        onBellClick={() => handlePageChange('Notifications')}
      />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 lg:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1a1c36] p-6 flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-fuchsia-600 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <h2 className="text-xl font-bold text-white">CampusConnect</h2>
          </div>
          <nav className="flex-1">
            <ul>
              {Object.entries(studentPages).map(([name, { icon }]) => (
                <li key={name} className="mb-2">
                  <button onClick={() => handlePageChange(name)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-3 ${activePage === name && !isProfileVisible ? 'bg-fuchsia-600 text-white' : 'hover:bg-gray-700/50'}`}>
                    {icon}<span>{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto pt-6 border-t border-gray-700/50">
            {/* DB status indicator */}
            <div className="flex items-center space-x-2 px-4 py-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${dbReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
              <span className="text-xs text-gray-500">{dbReady ? 'Database connected' : 'Connecting...'}</span>
            </div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-red-500/20 hover:text-red-400">
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {isProfileVisible ? <ProfilePage user={user} /> : studentPages[activePage].component}
        </main>

        <button onClick={() => setIsChatOpen(p => !p)}
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-fuchsia-600 to-purple-700 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-fuchsia-500 z-10"
          aria-label="Toggle Chat">
          <ChatIcon className="w-8 h-8" />
        </button>

        {isChatOpen && (
          <ChatPage
            user={user}
            onClose={() => setIsChatOpen(false)}
            initialQuery={prefilledQuery}
            onInitialQuerySent={() => setPrefilledQuery('')}
            contextToLoad={chatContextToLoad}
            onContextLoaded={() => setChatContextToLoad(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
