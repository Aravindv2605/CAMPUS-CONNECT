

const baseStudentData = {
    name: 'Aravindan',
    studentId: 'S123456',
    email: 'student@college.edu',
    timetable: [
        { day: 'Monday', course: 'CS305 - Algorithms', time: '10:00 AM - 11:30 AM', location: 'Hall A' },
        { day: 'Tuesday', course: 'BA202 - Marketing', time: '01:00 PM - 02:30 PM', location: 'Biz School B' },
        { day: 'Wednesday', course: 'CS203 - Data Structures', time: '11:00 AM - 12:30 PM', location: 'Lab 3' },
        { day: 'Thursday', course: 'CS101 - Intro to Programming', time: '02:00 PM - 03:30 PM', location: 'Hall C' },
        { day: 'Friday', course: 'BA101 - Management', time: '09:00 AM - 10:30 AM', location: 'Biz School A' },
    ],
    syllabus: [
        { course: 'CS305 - Algorithms', topics: ['Sorting', 'Graphs', 'Dynamic Programming'] },
        { course: 'BA202 - Marketing', topics: ['Market Research', 'Branding', 'Digital Marketing'] },
        { course: 'CS203 - Data Structures', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs'] },
        { course: 'CS101 - Intro to Programming', topics: ['Variables', 'Loops', 'Functions', 'Recursion'] },
        { course: 'BA101 - Management', topics: ['Planning', 'Organizing', 'Leading', 'Controlling'] },
    ],
    examSchedule: [
        { course: 'CS305 - Algorithms', date: '2024-12-15', time: '09:00 AM', type: 'Final' },
        { course: 'BA202 - Marketing', date: '2024-12-18', time: '01:00 PM', type: 'Final' },
        { course: 'CS203 - Data Structures', date: '2024-12-16', time: '09:00 AM', type: 'Final' },
    ],
    results: [
        { course: 'CS101 - Intro to Programming', grade: 'A' },
        { course: 'BA101 - Management', grade: 'B+' },
    ],
    fees: { total: 5000, paid: 5000, due: 0, deadline: 'N/A' },
    attendance: [
        { course: 'CS305 - Algorithms', percentage: 92 },
        { course: 'BA202 - Marketing', percentage: 88 },
        { course: 'CS203 - Data Structures', percentage: 95 },
        { course: 'CS101 - Intro to Programming', percentage: 98 },
        { course: 'BA101 - Management', percentage: 91 },
    ],
};

const studentAssignments = [
    { 
        course: 'CS305 - Algorithms', 
        title: 'Dynamic Programming Problem Set', 
        dueDate: '2024-11-25', 
        status: 'Upcoming',
        description: 'Solve a series of problems related to dynamic programming, including the knapsack problem, longest common subsequence, and matrix chain multiplication. Submission should include pseudocode and complexity analysis.'
    },
    { 
        course: 'BA202 - Marketing', 
        title: 'Case Study Analysis', 
        dueDate: '2024-11-28', 
        status: 'Upcoming',
        description: 'Analyze the provided marketing case study on "Globo-Mart\'s International Expansion". Submit a 5-page report on your findings, including a SWOT analysis and strategic recommendations.'
    },
    { 
        course: 'CS203 - Data Structures', 
        title: 'Final Project Proposal', 
        dueDate: '2024-12-01', 
        status: 'Upcoming',
        description: 'Submit a 2-page proposal for your final project. The proposal should outline the project scope, objectives, key data structures to be used, and a projected timeline.'
    },
    { 
        course: 'CS101 - Intro to Programming', 
        title: 'Recursion Homework', 
        dueDate: '2024-11-10', 
        status: 'Overdue',
        description: 'Complete the provided exercises on recursion. Ensure each solution includes a clear base case and recursive step. Test your functions with a variety of inputs.'
    },
    { 
        course: 'CS101 - Intro to Programming', 
        title: 'Lab 5 - Array Manipulation', 
        dueDate: '2024-11-01', 
        status: 'Completed',
        description: 'Implement various array manipulation functions as specified in the lab document, including functions for sorting, searching, and matrix operations.'
    },
    { 
        course: 'BA101 - Management', 
        title: 'Reading Response 4', 
        dueDate: '2024-11-05', 
        status: 'Completed',
        description: 'Write a 500-word critical response to the assigned reading on "Scientific Management". Discuss its historical context and relevance in modern workplaces.'
    },
];

export const PERSONALIZED_ACADEMIC_DATA = {
  "student@college.edu": {
    ...baseStudentData,
    assignments: studentAssignments,
  }
};