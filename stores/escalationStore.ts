// FIX: Import Escalation and User types to resolve reference errors.
import { Escalation, User } from '../types';

// In-memory store for escalations
let escalations: Escalation[] = [];

// In-memory knowledge base that grows as faculty respond.
// In a real app, this would be a persistent database.
export let knowledgeBase: { id: string, question: string, answer: string, category: string, usageCount: number }[] = [
    { 
        id: 'kb-1', 
        question: 'What are the library hours during final exams?', 
        answer: 'During final exams, the main library is open 24/7. Departmental libraries may have different hours.', 
        category: 'Library', 
        usageCount: 152 
    },
    { 
        id: 'kb-2', 
        question: 'How do I apply for a parking permit?', 
        answer: 'Students can apply for a parking permit through the student portal under the "Campus Services" section.', 
        category: 'Campus Services', 
        usageCount: 89 
    },
    { 
        id: 'kb-3', 
        question: 'What is the policy on late assignment submissions?', 
        answer: 'Policies vary by professor. Generally, a penalty of 10% per day is applied unless an extension was granted beforehand. Always check your course syllabus.', 
        category: 'Academics', 
        usageCount: 210 
    },
];

// --- Store for Escalations ---
type Listener = () => void;
let escalationListeners: Listener[] = [];

const notifyEscalationListeners = () => {
  escalationListeners.forEach(listener => listener());
};

export const subscribe = (listener: Listener) => {
  escalationListeners.push(listener);
  // Return an unsubscribe function
  return () => {
    escalationListeners = escalationListeners.filter(l => l !== listener);
  };
};


// --- Store for Total Resolved Queries ---
let totalResolvedQueries: number = 763215;
let queryStatsListeners: Listener[] = [];

const notifyQueryStatsListeners = () => {
    queryStatsListeners.forEach(listener => listener());
};

export const subscribeToQueryStats = (listener: Listener) => {
    queryStatsListeners.push(listener);
    return () => {
        queryStatsListeners = queryStatsListeners.filter(l => l !== listener);
    };
};

export const getTotalResolvedQueries = () => totalResolvedQueries;

export const incrementResolvedQueries = () => {
    totalResolvedQueries++;
    notifyQueryStatsListeners();
};


// --- Escalation and KB Functions ---

export const getEscalations = () => [...escalations];
export const getKnowledgeBase = () => [...knowledgeBase];

export const addEscalation = (question: string, user: User) => {
  const newEscalation: Escalation = {
    id: `esc-${Date.now()}`,
    question,
    user,
    status: 'pending',
  };
  escalations.push(newEscalation);
  notifyEscalationListeners();
  return newEscalation;
};

export const resolveEscalation = (id: string, answer: string) => {
  const escalationIndex = escalations.findIndex(e => e.id === id);
  if (escalationIndex !== -1) {
    const resolvedEscalation = escalations[escalationIndex];
    resolvedEscalation.status = 'resolved';
    resolvedEscalation.answer = answer;
    
    // Add the new, verified answer to the knowledge base for future use.
    if (!knowledgeBase.some(item => item.question.toLowerCase() === resolvedEscalation.question.toLowerCase())) {
        addKnowledgeBaseEntry(
            resolvedEscalation.question, 
            answer,
            'Uncategorized' // Default category for auto-added entries
        );
    }
    
    incrementResolvedQueries(); // A faculty resolution counts as a resolved query.
    notifyEscalationListeners();
    return resolvedEscalation;
  }
  return null;
};

// --- New Knowledge Base Management Functions ---

export const addKnowledgeBaseEntry = (question: string, answer: string, category: string) => {
    if (question.trim() && answer.trim()) {
        knowledgeBase.push({ 
            id: `kb-${Date.now()}`, 
            question, 
            answer, 
            category: category || 'General', 
            usageCount: 0 
        });
        notifyEscalationListeners();
    }
};

export const updateKnowledgeBaseEntry = (id: string, question: string, answer: string, category: string) => {
    const index = knowledgeBase.findIndex(item => item.id === id);
    if (index !== -1) {
        knowledgeBase[index] = { ...knowledgeBase[index], question, answer, category };
        notifyEscalationListeners();
    }
};

export const deleteKnowledgeBaseEntry = (id: string) => {
    knowledgeBase = knowledgeBase.filter(item => item.id === id);
    notifyEscalationListeners();
};