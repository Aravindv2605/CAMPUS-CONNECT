import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { subscribeToNotifications, markNotificationsAsRead } from '../services/firebaseService';

interface HeaderProps {
  user: User;
  onProfileClick: () => void;
  pageTitle: string;
  onMenuClick?: () => void;
  onBellClick?: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const Header: React.FC<HeaderProps> = ({ user, onProfileClick, pageTitle, onMenuClick, onBellClick }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.email, (data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, [user]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowPopup(prev => !prev);
    if (!showPopup && unreadCount > 0) {
      markNotificationsAsRead(user.email);
    }
  };

  const handleViewAll = () => {
    setShowPopup(false);
    onBellClick?.();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    } catch { return ''; }
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 bg-[#1a1c36] border-b border-gray-700/50">
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-white">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-6">
        <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
          <SearchIcon className="w-6 h-6" />
        </button>

        {/* Bell with popup */}
        <div className="relative" ref={popupRef}>
          <button onClick={handleBellClick} className="relative text-gray-400 hover:text-white transition-colors">
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-[#1a1c36]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popup */}
          {showPopup && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1a1c36] border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                <h3 className="text-white font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-fuchsia-400 bg-fuchsia-500/20 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? notifications.slice(0, 5).map((notif, i) => (
                  <div key={i} className={`px-4 py-3 border-b border-gray-700/30 hover:bg-[#2a2d4d] transition-colors ${notif.unread ? 'bg-fuchsia-500/5' : ''}`}>
                    <div className="flex items-start space-x-3">
                      {notif.unread && <div className="w-2 h-2 rounded-full bg-fuchsia-500 mt-1.5 flex-shrink-0" />}
                      {!notif.unread && <div className="w-2 h-2 mt-1.5 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 leading-snug">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notif.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No notifications yet
                  </div>
                )}
              </div>

              {/* View all button */}
              <div className="px-4 py-3 border-t border-gray-700/50">
                <button onClick={handleViewAll} className="w-full text-center text-sm text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors">
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-700 hidden sm:block"></div>
        <button onClick={onProfileClick} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <span className="text-sm font-medium hidden md:block">{user.name}</span>
          <UserCircleIcon className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
};

export default Header;