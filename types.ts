export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  image?: string;
}

export interface Escalation {
    id: string;
    question: string;
    user: User;
    status: 'pending' | 'resolved';
    answer?: string;
}
