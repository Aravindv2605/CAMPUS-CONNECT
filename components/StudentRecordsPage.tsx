import React, { useState, useEffect, useMemo } from 'react';
import { subscribeToStudentRecords, StudentRecord } from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const SearchIcon = () => <Icon path="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" className="w-6 h-6" />;
const ArrowUpIcon = () => <Icon path="M7 14l5-5 5 5z" />;
const ArrowDownIcon = () => <Icon path="M7 10l5 5 5-5z" />;

type SortKey = keyof StudentRecord;
type SortConfig = { key: SortKey; direction: 'ascending' | 'descending' } | null;

const getStatusColor = (status: StudentRecord['status']) => {
  switch (status) {
    case 'Excelling': return 'bg-green-500/20 text-green-400';
    case 'On Track': return 'bg-blue-500/20 text-blue-400';
    case 'At Risk': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const StudentRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStudentRecords((data) => {
      setRecords(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    let sorted = [...records];
    if (sortConfig) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sorted.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm, sortConfig]);

  const requestSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const TableHeader: React.FC<{ sortKey: SortKey; label: string }> = ({ sortKey, label }) => (
    <th className="px-6 py-3">
      <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 uppercase text-xs">
        <span>{label}</span>
        {sortConfig?.key === sortKey && (sortConfig.direction === 'ascending' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
      </button>
    </th>
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="relative mb-6">
        <input type="text" placeholder="Search by name, ID, or department..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-[#2a2d4d] border border-transparent rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
      </div>
      <div className="bg-[#2a2d4d] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 bg-[#1a1c36]">
              <tr>
                <TableHeader sortKey="id" label="Student ID" />
                <TableHeader sortKey="name" label="Name" />
                <TableHeader sortKey="department" label="Department" />
                <TableHeader sortKey="year" label="Year" />
                <TableHeader sortKey="gpa" label="GPA" />
                <TableHeader sortKey="status" label="Status" />
                <th className="px-6 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} className="border-b border-gray-700 hover:bg-[#3a3d5d]">
                  <td className="px-6 py-4 font-medium text-white">{student.id}</td>
                  <td className="px-6 py-4 text-white">{student.name}</td>
                  <td className="px-6 py-4">{student.department}</td>
                  <td className="px-6 py-4">{student.year}</td>
                  <td className="px-6 py-4">{typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>{student.status}</span>
                  </td>
                  <td className="px-6 py-4">{student.attendance ? `${student.attendance}%` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentRecordsPage;
