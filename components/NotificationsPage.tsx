import React, { useEffect, useState } from 'react';
import { User } from '../types';
import {
  subscribeToNotifications,
  markNotificationsAsRead,
  Notification,
} from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const GradeIcon = () => <Icon path="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />;
const AssignmentIcon = () => <Icon path="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 14H7v-2h5v2z" />;
const AlertIcon = () => <Icon path="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />;
const EventIcon = () => <Icon path="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />;
const ResponseIcon = () => <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />;
const ChatIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" className={className} />;

interface NotificationsPageProps {
  user: User;
  onContinueConversation: (question: string, answer: string) => void;
}

const typeColors: Record<string, string> = {
  grade: 'text-green-400 bg-green-500/10',
  assignment: 'text-amber-400 bg-amber-500/10',
  alert: 'text-red-400 bg-red-500/10',
  event: 'text-blue-400 bg-blue-500/10',
  faculty_response: 'text-fuchsia-400 bg-fuchsia-500/10',
};

const typeIcons: Record<string, React.ReactNode> = {
  grade: <GradeIcon />,
  assignment: <AssignmentIcon />,
  alert: <AlertIcon />,
  event: <EventIcon />,
  faculty_response: <ResponseIcon />,
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, onContinueConversation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(user.email, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    markNotificationsAsRead(user.email);
    return () => unsubscribe();
  }, [user.email]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-[#21243d] rounded-2xl shadow-lg p-2">
        <ul className="divide-y divide-gray-700/50">
          {notifications.length > 0 ? notifications.map((notif) => (
            <li key={notif.id} className={`flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-[#3a3d5d] ${notif.unread ? 'bg-[#2a2d4d]' : 'bg-transparent'}`}>
              <div className={`p-3 rounded-full flex-shrink-0 ${typeColors[notif.type] || 'text-gray-400 bg-gray-500/10'}`}>
                {typeIcons[notif.type] || <AlertIcon />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200">{notif.text}</p>
                {notif.type === 'faculty_response' && notif.metadata && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 italic">"{notif.metadata.question}"</p>
                    <p className="text-sm text-white font-semibold mt-1">{notif.metadata.answer}</p>
                    <button
                      onClick={() => onContinueConversation(notif.metadata!.question, notif.metadata!.answer)}
                      className="flex items-center space-x-2 text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 px-3 py-1.5 rounded-lg transition-colors mt-2"
                    >
                      <ChatIcon className="w-4 h-4" /><span>Continue in Chat</span>
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">{notif.time}</p>
              </div>
              {notif.unread && <div className="w-2.5 h-2.5 bg-fuchsia-500 rounded-full mt-1.5 flex-shrink-0"></div>}
            </li>
          )) : (
            <div className="text-center py-16 text-gray-400"><p>No notifications yet.</p></div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;
