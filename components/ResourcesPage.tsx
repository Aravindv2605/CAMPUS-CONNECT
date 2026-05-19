import React, { useState } from 'react';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const LibraryIcon = () => <Icon path="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />;
const BriefcaseIcon = () => <Icon path="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />;
const HeartIcon = () => <Icon path="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />;
const DocumentIcon = () => <Icon path="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />;
const LinkIcon = () => <Icon path="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1-3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />;
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <Icon path="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" className={className} />;


const resourcesData = [
    { 
        category: 'Academic Resources', 
        items: [
            { name: 'Library Portal', icon: <LibraryIcon />, description: 'Access digital archives, journals, and databases.', query: 'How do I access the library portal and what resources are available?' },
            { name: 'Academic Calendar', icon: <DocumentIcon />, description: 'View key dates for the semester.', query: 'Show me the key dates on the academic calendar for this semester.' },
            { name: 'Tutoring Services', icon: <HeartIcon />, description: 'Get help with challenging courses.', query: 'How can I find and sign up for tutoring services?' },
        ] 
    },
    { 
        category: 'Career & Development', 
        items: [
            { name: 'Career Services', icon: <BriefcaseIcon />, description: 'Find internships, resume help, and job postings.', query: 'What kind of career services does the college offer?' },
            { name: 'Student Workshop Schedule', icon: <DocumentIcon />, description: 'Sign up for skill-building workshops.', query: 'Are there any student workshops happening soon?' },
        ] 
    },
    { 
        category: 'Campus Life', 
        items: [
            { name: 'Student Wellness Center', icon: <HeartIcon />, description: 'Confidential health and wellness support.', query: 'Tell me about the Student Wellness Center.' },
            { name: 'Campus IT Helpdesk', icon: <LinkIcon />, description: 'Get tech support for your devices and accounts.', query: 'I need IT help. How do I contact the helpdesk?' },
        ] 
    },
];

const ResourceCard: React.FC<{ item: typeof resourcesData[0]['items'][0], onClick: () => void }> = ({ item, onClick }) => (
    <button
      onClick={onClick}
      className="bg-[#2a2d4d] p-5 rounded-lg shadow-lg flex items-center space-x-4 transition-transform hover:-translate-y-1 w-full text-left"
    >
        <div className="text-fuchsia-400">{item.icon}</div>
        <div className="flex-1">
            <h3 className="font-bold text-white">{item.name}</h3>
            <p className="text-sm text-gray-400">{item.description}</p>
        </div>
        <div className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
    </button>
);

interface ResourcesPageProps {
    onResourceClick: (query: string) => void;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ onResourceClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredResources = resourcesData.map(category => {
        const filteredItems = category.items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);

    return (
        <div className="animate-fade-in">
             <div className="relative mb-8">
                <input 
                    type="text"
                    placeholder="Search for resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#2a2d4d] border border-transparent rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon className="w-6 h-6" />
                </div>
            </div>

            {filteredResources.length > 0 ? (
                <div className="space-y-8">
                    {filteredResources.map((category, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-bold text-white mb-4 border-b-2 border-fuchsia-500/50 pb-2">{category.category}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((item, itemIndex) => (
                                    <ResourceCard key={itemIndex} item={item} onClick={() => onResourceClick(item.query)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-[#2a2d4d] rounded-lg">
                    <p className="text-gray-400 text-lg">No resources found for "{searchTerm}"</p>
                    <p className="text-gray-500 mt-2">Try searching for something else.</p>
                </div>
            )}
        </div>
    );
};

export default ResourcesPage;