import React from 'react';
import { Message, MessageSender } from '../types';

interface MessageDisplayProps {
  messages: Message[];
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
);

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 7.5V13.7C1 17.5 5.5 22 12 22S23 17.5 23 13.7V7.5L12 2ZM12 12.5L5.8 9.4L12 6.3L18.2 9.4L12 12.5ZM12 14.8L19 10.9V13.7C19 16.2 15.9 19 12 20.1C8.1 19 5 16.2 5 13.7V10.9L12 14.8Z" /></svg>
);

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);


const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end rounded-l-xl rounded-tr-xl'
    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 self-start rounded-r-xl rounded-tl-xl';
  
  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  const Icon = isUser ? UserIcon : BotIcon;
  const iconColor = isUser ? 'text-blue-200' : 'text-gray-400';

  return (
    <div className={`flex items-end gap-2 max-w-xl ${containerClasses}`}>
      {!isUser && <Icon className={`w-8 h-8 ${iconColor} mb-2 flex-shrink-0`} aria-hidden="true" />}
      <div className={`px-4 py-3 shadow-md ${bubbleClasses}`}>
        {message.text === '...' ? (
            <TypingIndicator />
        ) : (
            <p className="text-sm break-words">{message.text}</p>
        )}
        {message.image && (
            <div className="mt-2">
                <img src={message.image} alt="User upload" className="max-w-xs max-h-48 rounded-lg" />
            </div>
        )}
      </div>
      {isUser && <Icon className={`w-8 h-8 text-blue-500 mb-2 flex-shrink-0`} aria-hidden="true" />}
    </div>
  );
};


const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages }) => {
  return (
    <div className="space-y-6" role="log" aria-live="polite">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
};

export default MessageDisplay;