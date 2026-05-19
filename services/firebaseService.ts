/**
 * firebaseService.ts
 * 
 * Central service for all Firestore database operations in CampusConnect.
 * 
 * DATABASE STRUCTURE:
 * ├── users/            → Student & Faculty profiles
 * ├── assignments/      → Course assignments
 * ├── courses/          → Course catalog
 * ├── events/           → Campus events
 * ├── notifications/    → Per-user notifications
 * ├── escalations/      → Student → Faculty escalations
 * ├── knowledgeBase/    → FAQ / knowledge entries
 * ├── chatHistory/      → Chat logs per user
 * ├── aiQueries/        → AI query analytics
 * └── studentRecords/   → Faculty-facing student academic records
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty";
  department?: string;
  year?: string;
  gpa?: number;
  studentId?: string;
  createdAt?: Timestamp;
}

export interface Assignment {
  id: string;
  course: string;
  title: string;
  dueDate: string;
  status: "Upcoming" | "Overdue" | "Completed";
  description: string;
  assignedTo?: string; // email of student
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  instructor: string;
  description: string;
  instructorBio: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  dateString: string;
  location: string;
  category: "Tech" | "Academic" | "Social" | "Career" | "Arts";
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "grade" | "assignment" | "alert" | "event" | "faculty_response";
  text: string;
  time: string;
  unread: boolean;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface Escalation {
  id: string;
  question: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "pending" | "resolved";
  answer?: string;
  createdAt?: Timestamp;
  resolvedAt?: Timestamp;
}

export interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  usageCount: number;
  createdAt?: Timestamp;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  sender: "user" | "bot";
  imageUrl?: string;
  timestamp: Timestamp | null;
}

export interface AIQuery {
  id: string;
  userId: string;
  userName: string;
  query: string;
  status: "Resolved" | "Not Applicable" | "Escalated";
  date: Timestamp | null;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  gpa: number;
  status: "Excelling" | "On Track" | "At Risk";
  attendance?: number;
}

// ─────────────────────────────────────────────
// SEED DATA (runs once if collections are empty)
// ─────────────────────────────────────────────
export async function seedDatabaseIfEmpty() {
  try {
    // Check if courses already exist
    const coursesSnap = await getDocs(collection(db, "courses"));
    if (!coursesSnap.empty) return; // Already seeded

    console.log("🌱 Seeding Firestore database...");
    await seedCourses();
    await seedEvents();
    await seedKnowledgeBase();
    await seedStudentRecords();
    await seedAssignments();
    console.log("✅ Database seeded successfully!");
  } catch (e) {
    console.error("Error seeding database:", e);
  }
}

async function seedCourses() {
  const courses = [
    { code: "CS101", title: "Intro to Programming", department: "Computer Science", instructor: "Dr. Ada Lovelace", description: "Fundamentals of programming using Python, covering variables, control structures, functions, and basic data structures.", instructorBio: "A pioneering mathematician and writer, Dr. Lovelace is widely regarded as one of the first computer programmers." },
    { code: "CS203", title: "Data Structures", department: "Computer Science", instructor: "Dr. Alan Turing", description: "A deep dive into fundamental data structures including arrays, linked lists, trees, and graphs.", instructorBio: "A renowned mathematician and computer scientist, Dr. Turing played a pivotal role in the development of theoretical computer science." },
    { code: "BA101", title: "Principles of Management", department: "Business", instructor: "Prof. Peter Drucker", description: "An exploration of the core concepts of organizational management, including planning, organizing, leading, and controlling.", instructorBio: "An influential writer and management consultant, Prof. Drucker's work has shaped modern business corporations." },
    { code: "BA202", title: "Marketing Fundamentals", department: "Business", instructor: "Prof. Philip Kotler", description: "An introduction to marketing principles and strategies, covering market research, consumer behavior, branding, and digital marketing.", instructorBio: "Often called the 'father of modern marketing,' Prof. Kotler is a distinguished author and academic." },
    { code: "PHY101", title: "Classical Mechanics", department: "Physics", instructor: "Dr. Isaac Newton", description: "An introduction to Newtonian physics, focusing on the laws of motion, energy, momentum, and gravitation.", instructorBio: "A key figure in the scientific revolution, Dr. Newton's work laid the foundations for classical mechanics." },
    { code: "MECH201", title: "Thermodynamics", department: "Mechanical Engineering", instructor: "Dr. Sadi Carnot", description: "The study of heat, work, and energy, and their conversion from one form to another.", instructorBio: "A French military engineer and physicist, Dr. Carnot is often described as the 'father of thermodynamics.'" },
  ];
  for (const course of courses) {
    await addDoc(collection(db, "courses"), course);
  }
}

async function seedEvents() {
  const events = [
    { title: "Tech Symposium 2025", dateString: "2025-03-15", location: "Main Auditorium", category: "Tech", description: "Annual tech symposium featuring talks from industry leaders on AI, cloud computing, and the future of software development." },
    { title: "Entrepreneurship Summit", dateString: "2025-03-20", location: "Business School Hall", category: "Career", description: "Connect with startup founders, VCs, and business mentors. Pitch your ideas and get feedback." },
    { title: "Spring Cultural Fest", dateString: "2025-04-01", location: "Campus Grounds", category: "Social", description: "A celebration of diversity with food, music, dance, and cultural showcases from student clubs." },
    { title: "Research Paper Showcase", dateString: "2025-04-10", location: "Science Block", category: "Academic", description: "Students present their research projects to faculty and industry judges. Best papers win scholarships." },
    { title: "Music & Arts Night", dateString: "2025-04-18", location: "Performing Arts Center", category: "Arts", description: "An evening of student performances including classical music, modern dance, theatre, and visual arts exhibitions." },
    { title: "Hackathon 2025", dateString: "2025-05-02", location: "CS Lab Wing", category: "Tech", description: "48-hour hackathon. Build solutions for real-world campus problems. Prizes worth ₹50,000." },
  ];
  for (const event of events) {
    await addDoc(collection(db, "events"), event);
  }
}

async function seedKnowledgeBase() {
  const entries = [
    { question: "What are the library hours?", answer: "The library is open Monday–Friday from 8:00 AM to 10:00 PM, and Saturday–Sunday from 10:00 AM to 6:00 PM.", category: "Library", usageCount: 42 },
    { question: "How do I access the Wi-Fi on campus?", answer: "Connect to 'CampusNet' and log in using your student ID and password. Contact the IT helpdesk if you face issues.", category: "IT Support", usageCount: 38 },
    { question: "What is the grading scale?", answer: "A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: Below 60. GPA is calculated on a 4.0 scale.", category: "Academics", usageCount: 55 },
    { question: "How do I apply for a leave of absence?", answer: "Fill out the Leave Application form from the Student Services portal. Submit it at least 7 days before the intended leave date.", category: "Administration", usageCount: 18 },
    { question: "Where can I find the exam schedule?", answer: "The official exam schedule is posted on the student portal under 'Academics > Exam Schedule' at the beginning of each semester.", category: "Academics", usageCount: 67 },
    { question: "How do I contact my faculty advisor?", answer: "You can find your faculty advisor's contact details in the Student Portal under 'My Profile > Faculty Advisor'. Email is the preferred mode.", category: "Faculty", usageCount: 29 },
    { question: "What is the attendance requirement?", answer: "A minimum of 75% attendance is required per course. Students below this threshold may be barred from final exams.", category: "Academics", usageCount: 71 },
    { question: "How do I pay my tuition fees?", answer: "Fees can be paid online via the Student Portal under 'Finance > Pay Fees'. Accepted methods include net banking, UPI, and debit cards.", category: "Finance", usageCount: 33 },
  ];
  for (const entry of entries) {
    await addDoc(collection(db, "knowledgeBase"), entry);
  }
}

async function seedStudentRecords() {
  const records = [
    { name: "Aravindan", email: "student@college.edu", department: "Computer Science", year: "3rd Year", gpa: 3.85, status: "Excelling", attendance: 94 },
    { name: "Samantha Bee", email: "samantha@college.edu", department: "Business", year: "2nd Year", gpa: 3.60, status: "Excelling", attendance: 89 },
    { name: "Mike Ross", email: "mike@college.edu", department: "Computer Science", year: "3rd Year", gpa: 3.20, status: "On Track", attendance: 82 },
    { name: "Rachel Zane", email: "rachel@college.edu", department: "Physics", year: "2nd Year", gpa: 3.75, status: "Excelling", attendance: 91 },
    { name: "Harvey Specter", email: "harvey@college.edu", department: "Business", year: "4th Year", gpa: 2.40, status: "At Risk", attendance: 65 },
    { name: "Donna Paulsen", email: "donna@college.edu", department: "Mechanical Engineering", year: "1st Year", gpa: 3.10, status: "On Track", attendance: 78 },
    { name: "Louis Litt", email: "louis@college.edu", department: "Business", year: "4th Year", gpa: 2.10, status: "At Risk", attendance: 58 },
    { name: "Jessica Pearson", email: "jessica@college.edu", department: "Computer Science", year: "2nd Year", gpa: 3.90, status: "Excelling", attendance: 97 },
    { name: "Benjamin Tucker", email: "ben@college.edu", department: "Physics", year: "3rd Year", gpa: 2.70, status: "At Risk", attendance: 70 },
    { name: "Katrina Bennett", email: "katrina@college.edu", department: "Mechanical Engineering", year: "2nd Year", gpa: 3.40, status: "On Track", attendance: 85 },
  ];
  for (const record of records) {
    await setDoc(doc(db, "studentRecords", record.email), record);
  }
}

async function seedAssignments() {
  const assignments = [
    { course: "CS305 - Algorithms", title: "Dynamic Programming Problem Set", dueDate: "2025-03-25", status: "Upcoming", description: "Solve problems related to dynamic programming: knapsack, LCS, and matrix chain multiplication.", assignedTo: "student@college.edu" },
    { course: "BA202 - Marketing", title: "Case Study Analysis", dueDate: "2025-03-28", status: "Upcoming", description: "Analyze the provided marketing case study. Submit a 5-page report with SWOT analysis.", assignedTo: "student@college.edu" },
    { course: "CS203 - Data Structures", title: "Final Project Proposal", dueDate: "2025-04-01", status: "Upcoming", description: "Submit a 2-page proposal for your final project with objectives and timeline.", assignedTo: "student@college.edu" },
    { course: "CS101 - Intro to Programming", title: "Recursion Homework", dueDate: "2025-03-10", status: "Overdue", description: "Complete the provided exercises on recursion. Ensure each solution includes a base case.", assignedTo: "student@college.edu" },
    { course: "CS101 - Intro to Programming", title: "Lab 5 - Array Manipulation", dueDate: "2025-03-01", status: "Completed", description: "Implement array manipulation functions including sorting, searching, and matrix operations.", assignedTo: "student@college.edu" },
    { course: "BA101 - Management", title: "Reading Response 4", dueDate: "2025-03-05", status: "Completed", description: "Write a 500-word critical response to the reading on 'Scientific Management'.", assignedTo: "student@college.edu" },
  ];
  for (const assignment of assignments) {
    await addDoc(collection(db, "assignments"), assignment);
  }
}

// ─────────────────────────────────────────────
// USER OPERATIONS
// ─────────────────────────────────────────────
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  } catch (e) {
    console.error("getUserProfile error:", e);
    return null;
  }
}

export async function createOrUpdateUserProfile(user: Omit<UserProfile, "createdAt">) {
  try {
    const userRef = doc(db, "users", user.email);
    await setDoc(userRef, { ...user, createdAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error("createOrUpdateUserProfile error:", e);
  }
}

export async function updateUserProfile(email: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, data);
  } catch (e) {
    console.error("updateUserProfile error:", e);
  }
}

// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────
export async function getCourses(): Promise<Course[]> {
  try {
    const snap = await getDocs(collection(db, "courses"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
  } catch (e) {
    console.error("getCourses error:", e);
    return [];
  }
}

export function subscribeToCoures(callback: (courses: Course[]) => void) {
  return onSnapshot(collection(db, "courses"), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
  });
}

// ─────────────────────────────────────────────
// ASSIGNMENTS
// ─────────────────────────────────────────────
export async function getAssignmentsForUser(email: string): Promise<Assignment[]> {
  try {
    const q = query(collection(db, "assignments"), where("assignedTo", "==", email));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
  } catch (e) {
    console.error("getAssignmentsForUser error:", e);
    return [];
  }
}

export function subscribeToAssignments(email: string, callback: (assignments: Assignment[]) => void) {
  const q = query(collection(db, "assignments"), where("assignedTo", "==", email));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
  });
}

export async function updateAssignmentStatus(id: string, status: Assignment["status"]) {
  try {
    await updateDoc(doc(db, "assignments", id), { status });
  } catch (e) {
    console.error("updateAssignmentStatus error:", e);
  }
}

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────
export async function getEvents(): Promise<CampusEvent[]> {
  try {
    const snap = await getDocs(collection(db, "events"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CampusEvent));
  } catch (e) {
    console.error("getEvents error:", e);
    return [];
  }
}

export function subscribeToEvents(callback: (events: CampusEvent[]) => void) {
  return onSnapshot(collection(db, "events"), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as CampusEvent)));
  });
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
  } catch (e) {
    console.error("getNotificationsForUser error:", e);
    return [];
  }
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, snap => {
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Notification))
      .sort((a, b) => b.timestamp - a.timestamp); // sort in JS instead
    callback(data);
  });
}

export async function markNotificationsAsRead(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("unread", "==", true)
    );
    const snap = await getDocs(q);
    for (const docSnap of snap.docs) {
      await updateDoc(docSnap.ref, { unread: false });
    }
  } catch (e) {
    console.error("markNotificationsAsRead error:", e);
  }
}

export async function addNotification(notification: Omit<Notification, "id">) {
  try {
    await addDoc(collection(db, "notifications"), notification);
  } catch (e) {
    console.error("addNotification error:", e);
  }
}

// ─────────────────────────────────────────────
// ESCALATIONS
// ─────────────────────────────────────────────
export async function getEscalations(): Promise<Escalation[]> {
  try {
    const q = query(collection(db, "escalations"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Escalation));
  } catch (e) {
    console.error("getEscalations error:", e);
    return [];
  }
}

export function subscribeToEscalations(callback: (escalations: Escalation[]) => void) {
  const q = query(collection(db, "escalations"), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Escalation)));
  });
}

export async function createEscalation(data: {
  question: string;
  userId: string;
  userName: string;
  userEmail: string;
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "escalations"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("createEscalation error:", e);
    return "";
  }
}

export async function resolveEscalation(id: string, answer: string, studentEmail: string, question: string) {
  try {
    await updateDoc(doc(db, "escalations", id), {
      status: "resolved",
      answer,
      resolvedAt: serverTimestamp(),
    });
    // Notify student
    await addNotification({
      userId: studentEmail,
      type: "faculty_response",
      text: `Faculty replied to your question: "${question.substring(0, 60)}..."`,
      time: "Just now",
      unread: true,
      timestamp: Date.now(),
      metadata: { question, answer },
    });
    // Log as AI query
    await addAIQuery({
      userId: studentEmail,
      userName: studentEmail,
      query: question,
      status: "Resolved",
    });
  } catch (e) {
    console.error("resolveEscalation error:", e);
  }
}

// ─────────────────────────────────────────────
// KNOWLEDGE BASE
// ─────────────────────────────────────────────
export async function getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
  try {
    const snap = await getDocs(collection(db, "knowledgeBase"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeBaseEntry));
  } catch (e) {
    console.error("getKnowledgeBase error:", e);
    return [];
  }
}

export function subscribeToKnowledgeBase(callback: (entries: KnowledgeBaseEntry[]) => void) {
  return onSnapshot(collection(db, "knowledgeBase"), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as KnowledgeBaseEntry)));
  });
}

export async function addKnowledgeBaseEntry(entry: Omit<KnowledgeBaseEntry, "id">) {
  try {
    await addDoc(collection(db, "knowledgeBase"), { ...entry, createdAt: serverTimestamp() });
  } catch (e) {
    console.error("addKnowledgeBaseEntry error:", e);
  }
}

export async function updateKnowledgeBaseEntry(id: string, data: Partial<KnowledgeBaseEntry>) {
  try {
    await updateDoc(doc(db, "knowledgeBase", id), data);
  } catch (e) {
    console.error("updateKnowledgeBaseEntry error:", e);
  }
}

export async function deleteKnowledgeBaseEntry(id: string) {
  try {
    await deleteDoc(doc(db, "knowledgeBase", id));
  } catch (e) {
    console.error("deleteKnowledgeBaseEntry error:", e);
  }
}

export async function incrementKBUsage(id: string) {
  try {
    await updateDoc(doc(db, "knowledgeBase", id), { usageCount: increment(1) });
  } catch (e) {
    console.error("incrementKBUsage error:", e);
  }
}

// ─────────────────────────────────────────────
// CHAT HISTORY
// ─────────────────────────────────────────────
export async function saveChatMessage(userId: string, message: Omit<ChatMessage, "id" | "userId">) {
  try {
    await addDoc(collection(db, "chatHistory"), {
      ...message,
      userId,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("saveChatMessage error:", e);
  }
}

export async function getChatHistory(userId: string, limitCount = 50): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, "chatHistory"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).reverse();
  } catch (e) {
    console.error("getChatHistory error:", e);
    return [];
  }
}

// ─────────────────────────────────────────────
// AI QUERY ANALYTICS
// ─────────────────────────────────────────────
export async function addAIQuery(data: Omit<AIQuery, "id" | "date">) {
  try {
    await addDoc(collection(db, "aiQueries"), {
      ...data,
      date: serverTimestamp(),
    });
  } catch (e) {
    console.error("addAIQuery error:", e);
  }
}

export async function getAIQueries(): Promise<AIQuery[]> {
  try {
    const q = query(collection(db, "aiQueries"), orderBy("date", "desc"), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIQuery));
  } catch (e) {
    console.error("getAIQueries error:", e);
    return [];
  }
}

export function subscribeToAIQueries(callback: (queries: AIQuery[]) => void) {
  const q = query(collection(db, "aiQueries"), orderBy("date", "desc"), limit(100));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AIQuery)));
  });
}

// ─────────────────────────────────────────────
// STUDENT RECORDS (Faculty view)
// ─────────────────────────────────────────────
export async function getStudentRecords(): Promise<StudentRecord[]> {
  try {
    const snap = await getDocs(collection(db, "studentRecords"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentRecord));
  } catch (e) {
    console.error("getStudentRecords error:", e);
    return [];
  }
}

export function subscribeToStudentRecords(callback: (records: StudentRecord[]) => void) {
  return onSnapshot(collection(db, "studentRecords"), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentRecord)));
  });
}
