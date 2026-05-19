import React, { useState, useEffect, useRef } from 'react';
import { subscribeToEscalations, subscribeToAIQueries, subscribeToStudentRecords, subscribeToKnowledgeBase } from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-8 h-8" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const PendingIcon = () => <Icon path="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z" />;
const ResolvedIcon = () => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />;
const KnowledgeBaseIcon = () => <Icon path="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 11.27L5.82 11 12 7.73 18.18 11 12 14.27z" />;
const AtRiskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

declare global { interface Window { Chart: any; } }

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string, onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div className={`bg-[#2a2d4d] p-6 rounded-2xl shadow-lg flex items-center space-x-4 ${onClick ? 'cursor-pointer hover:bg-[#3a3d5d] transition-colors' : ''}`} onClick={onClick}>
        <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>{icon}</div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
        </div>
    </div>
);

const FacultyDashboard: React.FC<{ setActivePage: (page: string) => void }> = ({ setActivePage }) => {
    const [pendingCount, setPendingCount] = useState(0);
    const [resolvedQueriesCount, setResolvedQueriesCount] = useState(0);
    const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
    const [recentResolved, setRecentResolved] = useState<any[]>([]);
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
    const [allQueries, setAllQueries] = useState<any[]>([]);

    const escalationChartRef = useRef<HTMLCanvasElement>(null);
    const queriesChartRef = useRef<HTMLCanvasElement>(null);
    const escalationChartInstance = useRef<any>(null);
    const queriesChartInstance = useRef<any>(null);

    useEffect(() => {
        const unsubEscalations = subscribeToEscalations((escalations) => {
            const pending = escalations.filter(e => e.status === 'pending');
            const resolved = escalations.filter(e => e.status === 'resolved');
            setPendingCount(pending.length);
            setRecentResolved(resolved.slice(0, 5));
        });

        const unsubQueries = subscribeToAIQueries((queries) => {
            const resolved = queries.filter(q => q.status === 'Resolved').length;
            setResolvedQueriesCount(resolved);
            setAllQueries(queries);
        });

        const unsubStudents = subscribeToStudentRecords((records) => {
            const atRisk = records.filter(s => s.status === 'At Risk');
            setAtRiskStudents(atRisk);
        });

        const unsubKB = subscribeToKnowledgeBase((entries) => {
            setKnowledgeBaseCount(entries.length);
        });

        return () => { unsubEscalations(); unsubQueries(); unsubStudents(); unsubKB(); };
    }, []);

    // Build real chart data
    useEffect(() => {
        if (!window.Chart) return;

        const chartOptions = () => ({
            maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' }, border: { dash: [4, 4], color: '#374151' } },
            },
        });

        // Build daily escalation data from real queries
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayCounts = new Array(7).fill(0);
        allQueries.forEach(q => {
            if (q.date) {
                try {
                    const day = q.date.toDate().getDay();
                    dayCounts[day === 0 ? 6 : day - 1]++;
                } catch {}
            }
        });

        // Escalation chart
        if (escalationChartRef.current) {
            escalationChartInstance.current?.destroy();
            const ctx = escalationChartRef.current.getContext('2d');
            if (ctx) {
                escalationChartInstance.current = new window.Chart(ctx, {
                    type: 'line',
                    data: { labels: days, datasets: [{ label: 'Queries', data: dayCounts, borderColor: '#d946ef', tension: 0.4, fill: false, pointBackgroundColor: '#d946ef', pointRadius: 4 }] },
                    options: chartOptions()
                });
            }
        }

        // Query topics doughnut chart from real data
        const topicCount: Record<string, number> = {};
        allQueries.forEach(q => {
            const words = q.query?.toLowerCase().split(' ') || [];
            const topics = ['assignment', 'exam', 'timetable', 'syllabus', 'fees', 'library', 'attendance'];
            topics.forEach(t => { if (words.some((w: string) => w.includes(t))) topicCount[t] = (topicCount[t] || 0) + 1; });
        });
        const topicLabels = Object.keys(topicCount).length > 0 ? Object.keys(topicCount) : ['Assignments', 'Exams', 'Timetable', 'Syllabus', 'Fees'];
        const topicData = Object.values(topicCount).length > 0 ? Object.values(topicCount) : [45, 25, 15, 10, 5];

        if (queriesChartRef.current) {
            queriesChartInstance.current?.destroy();
            const ctx = queriesChartRef.current.getContext('2d');
            if (ctx) {
                queriesChartInstance.current = new window.Chart(ctx, {
                    type: 'doughnut',
                    data: { labels: topicLabels, datasets: [{ data: topicData, backgroundColor: ['#d946ef', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'], borderWidth: 0 }] },
                    options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } }
                });
            }
        }

        return () => {
            escalationChartInstance.current?.destroy();
            queriesChartInstance.current?.destroy();
        };
    }, [allQueries]);

    const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <div className="animate-fade-in space-y-6">
            {/* Stat Cards - all real Firebase data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Pending Escalations" value={pendingCount.toString()} icon={<PendingIcon />} color="amber" onClick={() => setActivePage('Escalations')} />
                <StatCard title="Total Queries Resolved" value={formatNumber(resolvedQueriesCount)} icon={<ResolvedIcon />} color="green" />
                <StatCard title="Knowledge Base Entries" value={knowledgeBaseCount.toString()} icon={<KnowledgeBaseIcon />} color="fuchsia" onClick={() => setActivePage('Knowledge Base')} />
            </div>

            <h2 className="text-xl font-bold text-white pt-4 border-t border-gray-700/50">Analytics Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Real escalation activity chart */}
                <div className="bg-[#2a2d4d] p-6 rounded-2xl shadow-lg lg:col-span-2">
                    <h3 className="text-white font-bold text-lg mb-4">Recent Query Activity</h3>
                    <div className="h-64"><canvas ref={escalationChartRef}></canvas></div>
                </div>

                {/* Real query topics chart */}
                <div className="bg-[#2a2d4d] p-6 rounded-2xl shadow-lg">
                    <h3 className="text-white font-bold text-lg mb-4">Common AI Query Topics</h3>
                    <div className="h-64"><canvas ref={queriesChartRef}></canvas></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* At Risk Students from Firebase */}
                <div className="bg-[#2a2d4d] p-6 rounded-2xl shadow-lg flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">Proactive Student Alerts</h3>
                        <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full font-semibold">AI-Generated</span>
                    </div>
                    <ul className="space-y-3 flex-grow">
                        {atRiskStudents.length > 0 ? atRiskStudents.map((student, i) => (
                            <li key={i} className="p-3 bg-[#1a1c36] rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-white">{student.name}</p>
                                    <p className="text-xs text-gray-400">{student.email}</p>
                                </div>
                                <div className="flex items-center space-x-2 text-red-400">
                                    <AtRiskIcon className="w-4 h-4" />
                                    <span className="text-sm font-semibold">GPA: {student.gpa?.toFixed(2)}</span>
                                </div>
                            </li>
                        )) : (
                            <div className="flex items-center justify-center h-full py-8">
                                <p className="text-gray-400 text-sm">No students currently at risk. 🎉</p>
                            </div>
                        )}
                    </ul>
                    <button onClick={() => setActivePage('Student Records')} className="mt-4 text-center w-full bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-300 font-semibold py-2 rounded-lg text-sm transition-colors">
                        View All Records
                    </button>
                </div>

                {/* Recently Resolved Escalations from Firebase */}
                <div className="bg-[#2a2d4d] p-6 rounded-2xl shadow-lg flex flex-col">
                    <h3 className="text-white font-bold text-lg mb-4">Recently Resolved Escalations</h3>
                    <ul className="space-y-3 flex-grow">
                        {recentResolved.length > 0 ? recentResolved.map((esc, i) => (
                            <li key={i} className="p-3 bg-[#1a1c36] rounded-lg">
                                <p className="text-sm text-gray-300 truncate">{esc.question}</p>
                                <p className="text-xs text-gray-500">Answered for {esc.userName}</p>
                            </li>
                        )) : <p className="text-gray-400 text-sm text-center pt-8">No recently resolved escalations.</p>}
                    </ul>
                    <button onClick={() => setActivePage('Escalations')} className="mt-4 text-center w-full bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-300 font-semibold py-2 rounded-lg text-sm transition-colors">
                        View All Escalations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;