
import { User } from '../types';

export interface FacultyResponse {
  question: string;
  answer: string;
  user: User;
  timestamp: number;
}

let responses: FacultyResponse[] = [];
let unreadResponses: Set<string> = new Set(); // Set of user IDs with unread responses

// Create a reactive store using a simple listener pattern
type Listener = () => void;
let listeners: Listener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const subscribeToResponses = (listener: Listener) => {
  listeners.push(listener);
  // Return an unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const addFacultyResponse = (response: Omit<FacultyResponse, 'timestamp'>) => {
  const newResponse = { ...response, timestamp: Date.now() };
  responses.unshift(newResponse); // Add to the top
  unreadResponses.add(response.user.id);
  notifyListeners();
  return newResponse;
};

export const getHasUnreadResponse = (user: User): boolean => {
    return unreadResponses.has(user.id);
}

export const getResponsesForUser = (user: User): FacultyResponse[] => {
    return responses.filter(r => r.user.id === user.id);
}

export const markResponsesAsRead = (user: User) => {
    if (unreadResponses.has(user.id)) {
        unreadResponses.delete(user.id);
        notifyListeners();
    }
}
