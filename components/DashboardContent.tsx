import React, { useState, useRef, useEffect } from 'react';
import { subscribeToAIQueries, subscribeToEvents, subscribeToAssignments, subscribeToStudentRecords } from '../services/firebaseService';
import { User } from '../types';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const ClipboardListIcon = () => <Icon path="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm9 8h-5v-2h5v2zm0-4h-5v-2h5v2zm0-4h-5V7h5v2z" />;
const BellAlertIcon = () => <Icon path="M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 4 0v.29c2.97.88 5 3.61 5 6.71v6l2 2zM12 23a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z" />;

declare global { interface Window { Chart: any; } }

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const ChartComponent: React.FC<{ type: any, data: any, options: any, title: string, value: string, subTitle?: string }> = ({ type, data, options, title, value, subTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  useEffect(() => {
    if (canvasRef.current && window.Chart) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current?.destroy();
        chartInstance.current = new window.Chart(ctx, { type, data, options });
      }
    }
    return () => { chartInstance.current?.destroy(); };
  }, [type, data, options]);
  return (
    <div className="bg-[#2a2d4d] p-4 sm:p-6 rounded-2xl shadow-lg h-full flex flex-col">
      {title && <h3 className="text-gray-400 text-sm font-medium">{title}</h3>}
      {value && <p className="text-white text-2xl sm:text-3xl font-bold mt-1">{value}</p>}
      {subTitle && <p className="text-teal-400 text-xs mt-1 font-semibold">{subTitle}</p>}
      <div className="flex-grow mt-4 min-h-0"><canvas ref={canvasRef}></canvas></div>
    </div>
  );
};

interface DashboardContentProps {
  user?: User;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [activeMainChartFilter, setActiveMainChartFilter] = useState('All Queries');
  const [activeTaskTab, setActiveTaskTab] = useState('Upcoming');
  const [allQueries, setAllQueries] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [overdueAssignments, setOverdueAssignments] = useState<any[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  const mainChartFilters = ['All Queries', 'Resolved', 'Escalated'];
  const taskTabs = ['Upcoming', 'Overdue', 'Completed'];

  useEffect(() => {
    const unsubQueries = subscribeToAIQueries((queries) => setAllQueries(queries));
    const unsubStudents = subscribeToStudentRecords((records) => setAllStudents(records));
    const email = user?.email || 'student@college.edu';
    const unsubAssignments = subscribeToAssignments(email, (assignments) => {
      setUpcomingAssignments(assignments.filter(a => a.status === 'Upcoming'));
      setOverdueAssignments(assignments.filter(a => a.status === 'Overdue'));
      setCompletedAssignments(assignments.filter(a => a.status === 'Completed'));
    });
    const unsubEvents = subscribeToEvents((events) => {
      setUpcomingEvents([...events].sort((a, b) => new Date(a.dateString).getTime() - new Date(b.dateString).getTime()).slice(0, 3));
    });
    return () => { unsubQueries(); unsubStudents(); unsubAssignments(); unsubEvents(); };
  }, [user]);

  const buildMonthlyData = (filterFn?: (q: any) => boolean) => {
    const counts = new Array(12).fill(0);
    allQueries.forEach(q => {
      if (q.date) { try { const m = q.date.toDate().getMonth(); if (!filterFn || filterFn(q)) counts[m]++; } catch {} }
    });
    return counts;
  };

  const buildDeptData = () => {
    const map: Record<string, number> = {};
    allStudents.forEach(s => { const d = s.department || 'Other'; map[d] = (map[d] || 0) + 1; });
    return { labels: Object.keys(map), data: Object.values(map) };
  };

  const monthlyAll = buildMonthlyData();
  const monthlyResolved = buildMonthlyData(q => q.status === 'Resolved');
  const monthlyEscalated = buildMonthlyData(q => q.status === 'Escalated');
  const dept = buildDeptData();
  const totalResolved = monthlyResolved.reduce((a, b) => a + b, 0);

  const mainChartData: Record<string, any> = {
    'All Queries': { labels: MONTHS, datasets: [{ label: 'All Queries', data: monthlyAll, borderColor: '#d946ef', tension: 0.4, fill: false, pointBackgroundColor: '#d946ef', pointRadius: 4 }] },
    'Resolved': { labels: MONTHS, datasets: [{ label: 'Resolved', data: monthlyResolved, borderColor: '#8b5cf6', tension: 0.4, fill: false, pointBackgroundColor: '#8b5cf6', pointRadius: 4 }] },
    'Escalated': { labels: MONTHS, datasets: [{ label: 'Escalated', data: monthlyEscalated, borderColor: '#3b82f6', tension: 0.4, fill: false, pointBackgroundColor: '#3b82f6', pointRadius: 4 }] }
  };

  const queriesResolvedData = { labels: MONTHS, datasets: [{ label: 'Resolved', data: monthlyResolved, borderColor: '#d946ef', tension: 0.4, fill: false, pointBackgroundColor: '#d946ef', pointRadius: 3 }] };
  const studentsByDeptData = { labels: dept.labels.length > 0 ? dept.labels : ['No data'], datasets: [{ label: 'Students', data: dept.data.length > 0 ? dept.data : [0], backgroundColor: '#3b82f6', borderRadius: 4 }] };
  const gpaTrendData = { labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5'], datasets: [{ label: 'GPA', data: [3.5,3.6,3.75,3.8,3.85], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.1)', fill: true, tension: 0.4, pointRadius: 0 }] };

  const chartOptions = (gridColor: string, suggestedMax?: number) => ({
    maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } },
    scales: { x: { ticks: { color: '#9ca3af' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, grid: { color: gridColor }, suggestedMax, border: { dash: [4,4], color: gridColor } } },
  });

  const sparklineOptions = {
    maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false, suggestedMin: 3.4, suggestedMax: 4.0 } },
  };

  const tasksMap: Record<string, any[]> = { 'Upcoming': upcomingAssignments, 'Overdue': overdueAssignments, 'Completed': completedAssignments };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Main Chart */}
      <div className="lg:col-span-3 bg-[#2a2d4d] p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-gray-400 text-sm font-medium">Student Engagement Trends</h3>
            <p className="text-white text-2xl sm:text-3xl font-bold mt-1">AI Query Stats <span className="text-sm font-normal text-gray-400 ml-2">({allQueries.length} total)</span></p>
          </div>
          <div className="flex items-center space-x-1 bg-[#1a1c36] p-1 rounded-lg mt-4 sm:mt-0">
            {mainChartFilters.map(f => (
              <button key={f} onClick={() => setActiveMainChartFilter(f)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${activeMainChartFilter === f ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-6 h-64">
          <ChartComponent type="line" data={mainChartData[activeMainChartFilter]} options={chartOptions('#374151')} title="" value="" />
        </div>
      </div>

      <ChartComponent type="line" data={queriesResolvedData} options={chartOptions('transparent')} title="Total Queries Resolved" value={totalResolved.toLocaleString()} />
      <ChartComponent type="bar" data={studentsByDeptData} options={chartOptions('transparent')} title="Students by Department" value={allStudents.length.toString()} />
      <ChartComponent type="line" data={gpaTrendData} options={sparklineOptions} title="Current GPA" value="3.85" subTitle="Positive Trend" />

      {/* Assignments */}
      <div className="lg:col-span-2 bg-[#2a2d4d] p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-2 border-b border-gray-700/50 pb-3">
          <h3 className="text-white font-bold text-lg flex-1 mb-3 sm:mb-0">My Assignments</h3>
          {taskTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTaskTab(tab)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTaskTab === tab ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
              {tab} ({tasksMap[tab].length})
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {tasksMap[activeTaskTab].length > 0 ? tasksMap[activeTaskTab].map((task, i) => (
            <li key={i} className="flex items-center justify-between p-3 bg-[#1a1c36] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-fuchsia-400"><ClipboardListIcon /></div>
                <div>
                  <p className="text-gray-300 font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.course}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 font-semibold ml-2">Due: {task.dueDate}</span>
            </li>
          )) : <li className="text-center py-6 text-gray-500 text-sm">No {activeTaskTab.toLowerCase()} assignments 🎉</li>}
        </ul>
      </div>

      {/* Events */}
      <div className="lg:col-span-1 bg-[#2a2d4d] p-4 sm:p-6 rounded-2xl shadow-lg">
        <h3 className="text-white font-bold text-lg mb-4">Upcoming Events</h3>
        <ul className="space-y-4">
          {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
            <li key={i} className="flex items-start space-x-3">
              <div className="text-teal-400 mt-1 flex-shrink-0"><BellAlertIcon /></div>
              <div>
                <p className="text-gray-300 font-medium text-sm">{event.title}</p>
                <p className="text-xs text-gray-500">{event.dateString} · {event.location}</p>
              </div>
            </li>
          )) : <li className="text-gray-500 text-sm text-center py-4">No upcoming events</li>}
        </ul>
      </div>
    </div>
  );
};

export default DashboardContent;
