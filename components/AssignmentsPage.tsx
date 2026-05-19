import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { subscribeToAssignments, updateAssignmentStatus, Assignment } from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" className={className} />;
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" className={className} />;
const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" className={className} />;
const FireIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z" className={className} />;

interface AssignmentsPageProps {
  user: User;
}

const statusInfo: { [key in Assignment['status']]: { color: string; icon: React.ReactNode } } = {
  Upcoming: { color: 'blue', icon: <ClockIcon /> },
  Overdue: { color: 'red', icon: <AlertCircleIcon /> },
  Completed: { color: 'green', icon: <CheckCircleIcon /> }
};

const AssignmentDetailsModal: React.FC<{ assignment: Assignment; onClose: () => void; onMarkComplete: () => void }> = ({ assignment, onClose, onMarkComplete }) => {
  const { color, icon } = statusInfo[assignment.status];
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#2a2d4d] p-8 rounded-2xl shadow-2xl w-full max-w-2xl text-white" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{assignment.course}</p>
            <h2 className="text-2xl font-bold text-white mt-1">{assignment.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex items-center space-x-4 mt-4 text-sm">
          <div className={`flex items-center space-x-2 text-${color}-400`}>{icon}<span className="font-semibold">{assignment.status}</span></div>
          <div className="w-px h-4 bg-gray-600"></div>
          <p className="text-gray-300">Due: {assignment.dueDate}</p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h3 className="font-semibold text-gray-300 mb-2">Description</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{assignment.description}</p>
        </div>
        {assignment.status !== 'Completed' && (
          <div className="mt-6">
            <button
              onClick={() => { onMarkComplete(); onClose(); }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Mark as Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AssignmentCard: React.FC<{ assignment: Assignment; onClick: () => void }> = ({ assignment, onClick }) => {
  const { color, icon } = statusInfo[assignment.status];
  const isDueSoon = () => {
    if (assignment.status !== 'Upcoming') return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(assignment.dueDate);
    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  };
  return (
    <button onClick={onClick} className="w-full text-left bg-[#2a2d4d] p-5 rounded-lg shadow-lg flex items-center justify-between transition-colors hover:bg-[#3a3d5d]">
      <div>
        <p className="text-sm text-gray-400">{assignment.course}</p>
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-bold text-white mt-1">{assignment.title}</h3>
          {isDueSoon() && <div className="mt-1"><FireIcon className="w-5 h-5 text-amber-500" /></div>}
        </div>
      </div>
      <div className="text-right">
        <div className={`flex items-center justify-end space-x-2 text-${color}-400`}>{icon}<span className="font-semibold text-sm">{assignment.status}</span></div>
        <p className="text-sm text-gray-300 mt-1">Due: {assignment.dueDate}</p>
      </div>
    </button>
  );
};

const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ user }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAssignments(user.email, (data) => {
      setAssignments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.email]);

  const grouped = {
    upcoming: assignments.filter(a => a.status === 'Upcoming'),
    overdue: assignments.filter(a => a.status === 'Overdue'),
    completed: assignments.filter(a => a.status === 'Completed'),
  };

  const tabs = [
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'overdue' as const, label: 'Overdue' },
    { key: 'completed' as const, label: 'Completed' },
  ];

  const handleMarkComplete = async (assignment: Assignment) => {
    await updateAssignmentStatus(assignment.id, 'Completed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-2 bg-[#2a2d4d] p-2 rounded-lg max-w-md mb-6">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab.key ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
            {tab.label} ({grouped[tab.key].length})
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {grouped[activeTab].length > 0
          ? grouped[activeTab].map(a => <AssignmentCard key={a.id} assignment={a} onClick={() => setSelectedAssignment(a)} />)
          : <div className="text-center py-10 bg-[#2a2d4d] rounded-lg"><p className="text-gray-400">No {activeTab} assignments.</p></div>
        }
      </div>
      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onMarkComplete={() => handleMarkComplete(selectedAssignment)}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
