import React, { useState } from 'react';
import { User } from '../types';

interface ProfilePageProps {
  user: User;
}

const Icon: React.FC<{ path: string, className?: string }> = ({ path, className = "w-6 h-6" }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const EmailIcon = () => <Icon path="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />;
const DepartmentIcon = () => <Icon path="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />;
const AcademicCapIcon = () => <Icon path="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />;
const GPATrendIcon = () => <Icon path="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z" />;

const EditField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean}> = ({ label, name, value, onChange, disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="mt-1 block w-full bg-[#1a1c36] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], disabled?: boolean}> = ({ label, name, value, onChange, options, disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="mt-1 block w-full bg-[#1a1c36] border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
        id: 'S123456',
        department: 'Computer Science',
        year: '3rd Year',
        gpa: '3.85'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState(profileData);

    const departmentOptions = ['Computer Science', 'Business', 'Physics', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'];
    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

    const handleEditClick = () => {
        setEditableData(profileData);
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleSaveClick = () => {
        setProfileData(editableData);
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Profile Header Card */}
                <div className="lg:col-span-3 bg-[#2a2d4d] p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                    <div className="w-24 h-24 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                        {profileData.name.charAt(0)}
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">{profileData.name}</h2>
                        <p className="text-gray-400">Student ID: {profileData.id}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0 w-full sm:w-auto">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancelClick} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSaveClick} className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEditClick} className="w-full sm:w-auto bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                     <div className="lg:col-span-3 bg-[#2a2d4d] p-6 sm:p-8 rounded-2xl shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                           <EditField label="Full Name" name="name" value={editableData.name} onChange={handleInputChange} />
                           <EditField label="Email Address" name="email" value={editableData.email} onChange={handleInputChange} />
                           <EditField label="Student ID" name="id" value={editableData.id} onChange={handleInputChange} disabled />
                           <SelectField label="Department" name="department" value={editableData.department} onChange={handleInputChange} options={departmentOptions} />
                           <SelectField label="Year of Study" name="year" value={editableData.year} onChange={handleInputChange} options={yearOptions} />
                           <EditField label="Current GPA" name="gpa" value={editableData.gpa} onChange={handleInputChange} />
                        </div>
                    </div>
                ) : (
                    <>
                        <InfoCard icon={<EmailIcon />} title="Email Address" value={profileData.email} />
                        <InfoCard icon={<DepartmentIcon />} title="Department" value={profileData.department} />
                        <InfoCard icon={<AcademicCapIcon />} title="Year of Study" value={profileData.year} />
                        <InfoCard icon={<GPATrendIcon />} title="Current GPA" value={profileData.gpa} />
                    </>
                )}
                
            </div>
        </div>
    );
};

const InfoCard: React.FC<{icon: React.ReactNode, title: string, value: string}> = ({ icon, title, value}) => (
    <div className="bg-[#2a2d4d] p-6 rounded-2xl shadow-lg flex items-center space-x-4">
        <div className="text-fuchsia-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
        </div>
    </div>
)

export default ProfilePage;