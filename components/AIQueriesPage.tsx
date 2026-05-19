import React, { useState, useEffect } from 'react';
import { subscribeToAIQueries, AIQuery } from '../services/firebaseService';
import { Timestamp } from 'firebase/firestore';

const AIQueriesPage: React.FC = () => {
  const [queries, setQueries] = useState<AIQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAIQueries((data) => {
      setQueries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-500/20 text-green-400';
      case 'Escalated': return 'bg-amber-500/20 text-amber-400';
      case 'Not Applicable': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date: Timestamp | null) => {
    if (!date) return 'N/A';
    try {
      return date.toDate().toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in bg-[#2a2d4d] p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">AI Query History</h2>
        <span className="text-sm text-gray-400">{queries.length} queries logged</span>
      </div>
      {queries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No AI queries logged yet.</p>
          <p className="text-sm mt-2">Queries will appear here as students use the chat.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-[#1a1c36]">
              <tr>
                <th className="px-6 py-3 rounded-l-lg">Date</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Query</th>
                <th className="px-6 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.id} className="border-b border-gray-700 hover:bg-[#3a3d5d]">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(q.date)}</td>
                  <td className="px-6 py-4">{q.userName}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{q.query}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(q.status)}`}>{q.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AIQueriesPage;
