import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, imageFile?: File) => void;
  isLoading: boolean;
  isLiveSessionActive: boolean;
  onStartLiveSession: () => void;
  onStopLiveSession: () => void;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
);

const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
);

const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isLiveSessionActive, onStartLiveSession, onStopLiveSession }) => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (isLoading || (!text.trim() && !imageFile)) return;
    onSendMessage(text, imageFile ?? undefined);
    setText('');
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMicClick = () => {
    if (isLiveSessionActive) {
      onStopLiveSession();
    } else {
      onStartLiveSession();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const isInputDisabled = isLoading || isLiveSessionActive;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
      {imageFile && !isLiveSessionActive && (
        <div className="mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">Attached: {imageFile.name}</span>
            <button onClick={() => {setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = ""}} className="text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isLiveSessionActive ? "Listening... Speak now." : "Type your question here..."}
          className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200 disabled:opacity-50"
          disabled={isInputDisabled}
          aria-label="Type your question here"
        />
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} disabled={isInputDisabled} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800" aria-label="Attach an image">
            <PaperclipIcon className="w-6 h-6"/>
        </button>
        <button onClick={handleMicClick} disabled={isLoading} className={`p-2 rounded-full transition-colors ${isLiveSessionActive ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800`} aria-label={isLiveSessionActive ? 'Stop listening' : 'Start voice input'}>
            <MicIcon className="w-6 h-6"/>
        </button>
        <button
          onClick={handleSend}
          disabled={isInputDisabled || (!text.trim() && !imageFile)}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
