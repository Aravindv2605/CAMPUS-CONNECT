import React, { useState, useEffect } from 'react';
import {
  subscribeToEscalations,
  resolveEscalation,
  Escalation,
} from '../services/firebaseService';

const FacultyEscalationsPage: React.FC = () => {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEscalations((data) => {
      setEscalations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitAnswer = async (esc: Escalation) => {
    const answer = answers[esc.id]?.trim();
    if (!answer) return;
    setSubmitting(esc.id);
    await resolveEscalation(esc.id, answer, esc.userEmail, esc.question);
    setAnswers(prev => { const n = { ...prev }; delete n[esc.id]; return n; });
    setSubmitting(null);
  };

  const pending = escalations.filter(e => e.status === 'pending');
  const resolved = escalations.filter(e => e.status === 'resolved');

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Pending Escalations ({pending.length})</h2>
        {pending.length > 0 ? (
          <div className="space-y-4">
            {pending.map(esc => (
              <div key={esc.id} className="bg-[#2a2d4d] p-6 rounded-lg shadow-lg">
                <p className="text-sm text-gray-400">From: {esc.userName} ({esc.userEmail})</p>
                <p className="text-lg text-white mt-2 font-semibold">"{esc.question}"</p>
                <div className="mt-4">
                  <textarea
                    value={answers[esc.id] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [esc.id]: e.target.value }))}
                    placeholder="Type your answer here..."
                    className="w-full bg-[#1a1c36] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm"
                    rows={3}
                  />
                  <button
                    onClick={() => handleSubmitAnswer(esc)}
                    disabled={!answers[esc.id]?.trim() || submitting === esc.id}
                    className="mt-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting === esc.id ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Submitting...</span></>
                    ) : <span>Submit Answer</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#2a2d4d] rounded-lg"><p className="text-gray-400">No pending escalations.</p></div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Resolved Escalations ({resolved.length})</h2>
        {resolved.length > 0 ? (
          <div className="space-y-4">
            {resolved.map(esc => (
              <div key={esc.id} className="bg-[#2a2d4d] p-6 rounded-lg shadow-lg opacity-70">
                <p className="text-sm text-gray-400">From: {esc.userName} ({esc.userEmail})</p>
                <p className="text-md text-gray-300 mt-2"><strong>Q:</strong> "{esc.question}"</p>
                <p className="text-md text-green-400 mt-2"><strong>A:</strong> "{esc.answer}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#2a2d4d] rounded-lg"><p className="text-gray-400">No resolved escalations yet.</p></div>
        )}
      </div>
    </div>
  );
};

export default FacultyEscalationsPage;
