export interface StudentRecord {
  id: string;
  name: string;
  department: string;
  year: number;
  gpa: number;
  lastInteraction: string; // date string
  status: 'On Track' | 'At Risk' | 'Excelling';
}

export const studentsData: StudentRecord[] = [
  { id: 'S123456', name: 'Aravindan', department: 'Computer Science', year: 3, gpa: 3.85, lastInteraction: '2024-11-20', status: 'Excelling' },
  { id: 'S123457', name: 'Samantha Bee', department: 'Business', year: 2, gpa: 3.4, lastInteraction: '2024-11-20', status: 'On Track' },
  { id: 'S123458', name: 'Mike Ross', department: 'Computer Science', year: 1, gpa: 3.1, lastInteraction: '2024-11-19', status: 'On Track' },
  { id: 'S123459', name: 'Rachel Zane', department: 'Physics', year: 4, gpa: 3.9, lastInteraction: '2024-11-19', status: 'Excelling' },
  { id: 'S123460', name: 'Harvey Specter', department: 'Mechanical Engineering', year: 3, gpa: 2.9, lastInteraction: '2024-11-18', status: 'At Risk' },
  { id: 'S123461', name: 'Donna Paulsen', department: 'Business', year: 2, gpa: 3.7, lastInteraction: '2024-11-18', status: 'On Track' },
  { id: 'S123462', name: 'Louis Litt', department: 'Computer Science', year: 4, gpa: 3.6, lastInteraction: '2024-11-17', status: 'On Track' },
  { id: 'S123463', name: 'Jessica Pearson', department: 'Physics', year: 1, gpa: 2.5, lastInteraction: '2024-11-16', status: 'At Risk' },
];