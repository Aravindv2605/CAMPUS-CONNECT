import React, { useState, useEffect, useMemo } from 'react';
import {
  subscribeToKnowledgeBase,
  addKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
  KnowledgeBaseEntry,
} from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const EditIcon = () => <Icon path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />;
const DeleteIcon = () => <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />;
const SearchIcon = () => <Icon path="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" className="w-6 h-6" />;

const getCategoryColor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['bg-blue-500/20 text-blue-300', 'bg-fuchsia-500/20 text-fuchsia-300', 'bg-green-500/20 text-green-300', 'bg-amber-500/20 text-amber-300', 'bg-rose-500/20 text-rose-300', 'bg-indigo-500/20 text-indigo-300'];
  return colors[Math.abs(hash) % colors.length];
};

type EntryForm = { id?: string; question: string; answer: string; category: string };

const KnowledgeBasePage: React.FC = () => {
  const [kb, setKb] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<EntryForm | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const unsubscribe = subscribeToKnowledgeBase((data) => {
      setKb(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...Array.from(new Set(kb.map(i => i.category)))];
  const filteredKb = useMemo(() => kb.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = searchTerm === '' || item.question.toLowerCase().includes(searchTerm.toLowerCase()) || item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  }), [kb, searchTerm, activeCategory]);

  const handleSave = async () => {
    if (!currentEntry || !currentEntry.question.trim() || !currentEntry.answer.trim()) return;
    setSaving(true);
    if (currentEntry.id) {
      await updateKnowledgeBaseEntry(currentEntry.id, { question: currentEntry.question, answer: currentEntry.answer, category: currentEntry.category });
    } else {
      await addKnowledgeBaseEntry({ question: currentEntry.question, answer: currentEntry.answer, category: currentEntry.category, usageCount: 0 });
    }
    setSaving(false);
    setIsModalOpen(false);
    setCurrentEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteKnowledgeBaseEntry(id);
    }
  };

  const Modal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#2a2d4d] p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">{currentEntry?.id ? 'Edit Entry' : 'Add New Entry'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <input type="text" value={currentEntry?.category || ''} onChange={e => setCurrentEntry(p => p ? { ...p, category: e.target.value } : p)}
              className="w-full bg-[#1a1c36] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Question</label>
            <textarea value={currentEntry?.question || ''} onChange={e => setCurrentEntry(p => p ? { ...p, question: e.target.value } : p)}
              className="w-full bg-[#1a1c36] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Answer</label>
            <textarea value={currentEntry?.answer || ''} onChange={e => setCurrentEntry(p => p ? { ...p, answer: e.target.value } : p)}
              className="w-full bg-[#1a1c36] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500" rows={5} />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={() => { setIsModalOpen(false); setCurrentEntry(null); }} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in">
      {isModalOpen && <Modal />}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-white">Manage Knowledge Base</h2>
        <button onClick={() => { setCurrentEntry({ question: '', answer: '', category: 'General' }); setIsModalOpen(true); }}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-5 rounded-lg">
          Add New Entry
        </button>
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-grow">
          <input type="text" placeholder="Search questions or answers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#2a2d4d] border border-transparent rounded-lg pl-12 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
        </div>
        <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
          className="bg-[#2a2d4d] border border-transparent rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="bg-[#2a2d4d] p-4 rounded-2xl shadow-lg overflow-x-auto">
        {filteredKb.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-[#1a1c36]">
              <tr>
                <th className="px-6 py-3 w-2/5 rounded-l-lg">Question</th>
                <th className="px-6 py-3 w-2/5">Answer</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-center">Usage</th>
                <th className="px-6 py-3 text-center rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKb.map(entry => (
                <tr key={entry.id} className="border-b border-gray-700 hover:bg-[#3a3d5d]">
                  <td className="px-6 py-4 text-white font-medium align-top">{entry.question}</td>
                  <td className="px-6 py-4 align-top">{entry.answer}</td>
                  <td className="px-6 py-4 align-top">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(entry.category)}`}>{entry.category}</span>
                  </td>
                  <td className="px-6 py-4 text-white font-semibold text-center align-top">{entry.usageCount}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex justify-center items-center space-x-4">
                      <button onClick={() => { setCurrentEntry(entry); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300"><EditIcon /></button>
                      <button onClick={() => handleDelete(entry.id)} className="text-red-400 hover:text-red-300"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16"><p className="text-gray-400">No entries match your criteria.</p></div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
