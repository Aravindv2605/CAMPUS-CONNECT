import React, { useState, useEffect } from 'react';
import { subscribeToEvents, CampusEvent } from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const LocationPinIcon = () => <Icon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />;
const CalendarIcon = () => <Icon path="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />;

const categoryColors = {
  Tech: { card: 'bg-blue-500/20 text-blue-400', text: 'text-blue-400' },
  Academic: { card: 'bg-fuchsia-500/20 text-fuchsia-400', text: 'text-fuchsia-400' },
  Social: { card: 'bg-amber-500/20 text-amber-400', text: 'text-amber-400' },
  Career: { card: 'bg-green-500/20 text-green-400', text: 'text-green-400' },
  Arts: { card: 'bg-rose-500/20 text-rose-400', text: 'text-rose-400' },
};

const EventDetailsModal: React.FC<{ event: CampusEvent; onClose: () => void }> = ({ event, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
    <div className="bg-[#2a2d4d] p-8 rounded-2xl shadow-2xl w-full max-w-2xl text-white" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-semibold ${categoryColors[event.category]?.text}`}>{event.category}</p>
          <h2 className="text-2xl font-bold text-white mt-1">{event.title}</h2>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex items-center space-x-4 mt-4 text-sm text-gray-300">
        <div className="flex items-center space-x-2"><CalendarIcon />
          <span>{new Date(event.dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
        </div>
        <div className="w-px h-4 bg-gray-600"></div>
        <div className="flex items-center space-x-2"><LocationPinIcon /><span>{event.location}</span></div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <h3 className="font-semibold text-gray-300 mb-2">About This Event</h3>
        <p className="text-gray-300">{event.description}</p>
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: CampusEvent; onClick: () => void }> = ({ event, onClick }) => {
  const date = new Date(event.dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  const colors = categoryColors[event.category];

  return (
    <button onClick={onClick} className="w-full text-left bg-[#2a2d4d] p-5 rounded-lg shadow-lg flex items-center space-x-5 transition-all hover:bg-[#3a3d5d]">
      <div className="flex flex-col items-center justify-center bg-[#1a1c36] p-4 rounded-lg w-20">
        <span className="text-3xl font-bold text-white">{day}</span>
        <span className="text-sm font-semibold text-fuchsia-400">{month}</span>
      </div>
      <div className="flex-1">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors?.card}`}>{event.category}</span>
        <h3 className="text-lg font-bold text-white mt-2">{event.title}</h3>
        <div className="flex items-center space-x-2 mt-1 text-gray-400 text-sm"><LocationPinIcon /><span>{event.location}</span></div>
      </div>
    </button>
  );
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];
  const filtered = events.filter(e => activeCategory === 'All' || e.category === activeCategory);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-2 bg-[#2a2d4d] p-2 rounded-lg mb-6 overflow-x-auto">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeCategory === cat ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.length > 0
          ? filtered.map(e => <EventCard key={e.id} event={e} onClick={() => setSelectedEvent(e)} />)
          : <div className="text-center py-10 bg-[#2a2d4d] rounded-lg"><p className="text-gray-400">No events found.</p></div>
        }
      </div>
      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
};

export default EventsPage;
