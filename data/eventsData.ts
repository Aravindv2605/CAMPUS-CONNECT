export interface CampusEvent {
  dateString: string;
  title: string;
  location: string;
  category: 'Tech' | 'Academic' | 'Social' | 'Career' | 'Arts';
  description: string;
}

export const eventsData: CampusEvent[] = [
    { 
        dateString: '2024-12-05', 
        title: 'Innovate 2024 - Annual Tech Fest', 
        location: 'Main Auditorium', 
        category: 'Tech',
        description: 'Join us for the biggest tech festival of the year! Featuring keynote speakers from top tech companies, hands-on workshops, a hackathon, and a project expo. A must-attend for all tech enthusiasts.'
    },
    { 
        dateString: '2024-12-08', 
        title: 'Guest Lecture: AI in Modern Business', 
        location: 'Business School, Hall C', 
        category: 'Academic',
        description: 'Discover how Artificial Intelligence is revolutionizing the business world. This guest lecture by industry expert Dr. Evelyn Reed will cover AI applications in marketing, finance, and operations.'
    },
    { 
        dateString: '2024-12-12', 
        title: 'Winter Gala - Student Formal Event', 
        location: 'Student Union Ballroom', 
        category: 'Social',
        description: 'Get ready for a night of elegance and fun at the annual Winter Gala. Enjoy music, dancing, and refreshments with your fellow students. Formal attire is encouraged.'
    },
    { 
        dateString: '2024-12-15', 
        title: 'Career Fair - Connect with Employers', 
        location: 'University Gymnasium', 
        category: 'Career',
        description: 'Meet representatives from over 50 companies looking to hire interns and full-time employees. Bring your resume and dress professionally. This is a fantastic networking opportunity.'
    },
    { 
        dateString: '2024-12-18', 
        title: 'Drama Club Presents: "A Midsummer Night\'s Dream"', 
        location: 'Performing Arts Center', 
        category: 'Arts',
        description: 'Experience the magic of Shakespeare\'s classic comedy. The university\'s drama club presents its much-anticipated production. Tickets are available at the box office.'
    },
];
