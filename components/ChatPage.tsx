import React, { useState, useEffect, useRef } from 'react';
import { User, Message, MessageSender } from '../types';
import { getAIResponse, generateResponseFromImage } from '../services/geminiService';
import MessageDisplay from './MessageDisplay';
import ChatInput from './ChatInput';
import { saveChatMessage, addAIQuery, createEscalation } from '../services/firebaseService';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

interface ChatPageProps {
  user: User;
  onClose: () => void;
  initialQuery?: string;
  onInitialQuerySent?: () => void;
  contextToLoad?: { question: string; answer: string } | null;
  onContextLoaded?: () => void;
}

const ESCALATION_TRIGGERS = [
  'not sure', "don't know", 'cannot help', 'speak to faculty',
  'contact professor', 'need human', 'escalate', "i'll escalate",
  'extra support', 'talk to someone', 'need help from', 'speak to someone',
  'human support', 'real person', 'talk to faculty', 'talk to professor','Faculty support'
];

const safeFirebase = async (fn: () => Promise<any>) => {
  try { await fn(); } catch (e) { console.warn('Firebase op failed (non-critical):', e); }
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

const ChatPage: React.FC<ChatPageProps> = ({
  user, onClose, initialQuery, onInitialQuerySent, contextToLoad, onContextLoaded
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: `Hi ${user.name}! 👋 I'm CampusConnect AI. Ask me anything about your courses, assignments, exams, fees, timetable, or campus life!`,
      sender: MessageSender.BOT
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<any>(null);
  const liveSessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const audioSources = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTime = useRef(0);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (API_KEY) {
      import('@google/genai').then(({ GoogleGenAI }) => {
        aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
      }).catch(console.error);
    }
    return () => { handleStopLiveSession(); };
  }, []);

  useEffect(() => {
    if (initialQuery && onInitialQuerySent) {
      handleSendTextMessage(initialQuery);
      onInitialQuerySent();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (contextToLoad && onContextLoaded) {
      setMessages(prev => [...prev,
        { id: `ctx-q-${Date.now()}`, text: contextToLoad.question, sender: MessageSender.USER },
        { id: `ctx-a-${Date.now()}`, text: `${contextToLoad.answer}\n\n*This answer was provided by a faculty member.*`, sender: MessageSender.BOT }
      ]);
      onContextLoaded();
    }
  }, [contextToLoad]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendTextMessage = async (text: string, imageFile?: File) => {
    if (!text.trim() && !imageFile) return;
    setIsLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: MessageSender.USER,
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };

    setMessages(prev => [...prev, userMsg, { id: 'typing', text: '...', sender: MessageSender.BOT }]);
    safeFirebase(() => saveChatMessage(user.email, { text, sender: 'user', timestamp: null }));

    try {
      let botText = '';

      if (imageFile) {
        // Image → Gemini
        const imageBase64 = await fileToBase64(imageFile);
        botText = await generateResponseFromImage(
          text || 'What does this image show?',
          imageBase64,
          imageFile.type
        );
      } else {
        // Text → Groq (free, no limits)
        botText = await getAIResponse(text);
      }

      const shouldEscalate = ESCALATION_TRIGGERS.some(t => 
      botText.toLowerCase().includes(t) || text.toLowerCase().includes(t)
      );
      const lastQuestion = messages
      .filter(m => m.sender === MessageSender.USER)
      .slice(-1)[0]?.text || text;
      if (shouldEscalate) {
        safeFirebase(() => createEscalation({ question: lastQuestion, userId: user.email, userName: user.name, userEmail: user.email }));
        safeFirebase(() => addAIQuery({ userId: user.email, userName: user.name, query: text, status: 'Escalated' }));
      } else {
        safeFirebase(() => addAIQuery({ userId: user.email, userName: user.name, query: text, status: 'Resolved' }));
      }
      safeFirebase(() => saveChatMessage(user.email, { text: botText, sender: 'bot', timestamp: null }));

      const finalText = shouldEscalate
        ? botText + '\n\n✅ *I\'ve sent this to a faculty member. You\'ll be notified when they respond.*'
        : botText;

      setMessages(prev => [...prev.filter(m => m.id !== 'typing'), {
        id: (Date.now() + 1).toString(),
        text: finalText,
        sender: MessageSender.BOT,
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev.filter(m => m.id !== 'typing'), {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: MessageSender.BOT,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLiveSession = async () => {
    if (!aiRef.current || isLiveSessionActive) return;
    setIsLiveSessionActive(true);
    setMessages(prev => [...prev, { id: 'live-start', text: '🎤 Voice session started. Listening...', sender: MessageSender.BOT }]);

    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    nextStartTime.current = 0;

    const sessionPromise = aiRef.current.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: ['AUDIO'],
        systemInstruction: `You are CampusConnect, a friendly AI assistant for college student ${user.name}. Keep answers concise and conversational.`
      },
      callbacks: {
        onopen: async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;
            const inputCtx = inputAudioContextRef.current!;
            mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(data);
              liveSessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputCtx.destination);
          } catch (err) {
            console.error("Microphone access denied:", err);
            setMessages(prev => [...prev, { id: 'mic-error', text: 'Microphone access denied.', sender: MessageSender.BOT }]);
            handleStopLiveSession();
          }
        },
        onmessage: async (message: any) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          const outputCtx = outputAudioContextRef.current;
          if (base64Audio && outputCtx) {
            nextStartTime.current = Math.max(nextStartTime.current, outputCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => audioSources.current.delete(source));
            source.start(nextStartTime.current);
            nextStartTime.current += audioBuffer.duration;
            audioSources.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            audioSources.current.forEach(s => s.stop());
            audioSources.current.clear();
            nextStartTime.current = 0;
          }
        },
        onerror: (e: ErrorEvent) => { console.error('Live error:', e); handleStopLiveSession(); },
        onclose: () => handleStopLiveSession(),
      },
    });
    liveSessionPromiseRef.current = sessionPromise;
  };

  const handleStopLiveSession = () => {
    setIsLiveSessionActive(false);
    microphoneStreamRef.current?.getTracks().forEach(t => t.stop());
    scriptProcessorRef.current?.disconnect();
    mediaStreamSourceRef.current?.disconnect();
    inputAudioContextRef.current?.close();
    audioSources.current.forEach(s => s.stop());
    audioSources.current.clear();
    outputAudioContextRef.current?.close();
    liveSessionPromiseRef.current?.then(s => s.close());
    liveSessionPromiseRef.current = null;
    setMessages(prev => [...prev.filter(m => m.id !== 'live-start'), { id: 'live-end', text: '🎤 Voice session ended.', sender: MessageSender.BOT }]);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#2a2d4d] animate-fade-in-up md:bottom-24 md:right-6 md:top-auto md:left-auto md:w-full md:max-w-md md:h-[70vh] md:max-h-[600px] md:rounded-2xl md:shadow-2xl">
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-[#1a1c36] md:rounded-t-2xl border-b border-gray-700/50">
        <div>
          <h3 className="text-lg font-bold text-white">CampusConnect AI</h3>
          <p className="text-xs text-gray-400">Powered by Groq & Gemini</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <MessageDisplay messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={handleSendTextMessage}
        isLoading={isLoading}
        isLiveSessionActive={isLiveSessionActive}
        onStartLiveSession={handleStartLiveSession}
        onStopLiveSession={handleStopLiveSession}
      />
    </div>
  );
};

export default ChatPage;