import React, { useState, useEffect } from 'react';
import { subscribeToCoures, Course } from '../services/firebaseService';

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-5 h-5" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const UserIcon = () => <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />;
const SearchIcon = () => <Icon path="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" className="w-6 h-6" />;

const CourseDetailsModal: React.FC<{ course: Course; onClose: () => void }> = ({ course, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
    <div className="bg-[#2a2d4d] p-8 rounded-2xl shadow-2xl w-full max-w-2xl text-white" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-fuchsia-400">{course.code} &bull; {course.department}</p>
          <h2 className="text-2xl font-bold text-white mt-1">{course.title}</h2>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-200 mb-2">Course Description</h3>
          <p className="text-gray-300">{course.description}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-200 mb-2">About the Instructor: <span className="font-bold">{course.instructor}</span></h3>
          <p className="text-gray-300">{course.instructorBio}</p>
        </div>
      </div>
    </div>
  </div>
);

const CourseCard: React.FC<{ course: Course; onClick: () => void }> = ({ course, onClick }) => (
  <button onClick={onClick} className="bg-[#2a2d4d] p-6 rounded-lg shadow-lg flex flex-col justify-between h-full transition-all hover:shadow-fuchsia-500/30 hover:-translate-y-1 text-left">
    <div>
      <p className="text-sm font-semibold text-fuchsia-400">{course.code}</p>
      <h3 className="text-xl font-bold text-white mt-2">{course.title}</h3>
      <p className="text-gray-300 mt-2 text-sm line-clamp-2">{course.description}</p>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center space-x-2">
      <UserIcon /><span className="text-sm text-gray-400">{course.instructor}</span>
    </div>
  </button>
);

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCoures((data) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const departments = ['All', ...Array.from(new Set(courses.map(c => c.department)))];
  const filtered = courses.filter(c =>
    (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeDept === 'All' || c.department === activeDept)
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-grow">
          <input type="text" placeholder="Search by course name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#2a2d4d] border border-transparent rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
        </div>
        <div className="flex items-center space-x-2 bg-[#2a2d4d] p-1.5 rounded-lg flex-wrap">
          {departments.map(dept => (
            <button key={dept} onClick={() => setActiveDept(dept)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeDept === dept ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
              {dept}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0
          ? filtered.map(c => <CourseCard key={c.id} course={c} onClick={() => setSelectedCourse(c)} />)
          : <div className="md:col-span-3 text-center py-10 bg-[#2a2d4d] rounded-lg"><p className="text-gray-400">No courses match your criteria.</p></div>
        }
      </div>
      {selectedCourse && <CourseDetailsModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
};

export default CoursesPage;
