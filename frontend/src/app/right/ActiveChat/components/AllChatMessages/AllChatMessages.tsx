import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';
import ChatMessage from '@/app/right/ActiveChat/components/ChatMessage';
import { useState, useEffect, useRef } from 'react';
import './spinner.css';

interface AllChatMessagesProps {
  messages: DBMessageWithUser[];
  chatMembersLength: number;
  username: string;
  loadMoreMessages: () => void;
  hasMore: boolean;
  isGroupChat: boolean;
  isMobile: boolean;
}

// ! TODO: Add virtual scrolling!
export default function AllChatMessages({
  messages,
  chatMembersLength,
  username,
  loadMoreMessages,
  hasMore,
  isGroupChat,
  isMobile,
}: AllChatMessagesProps) {
  const spinner = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only set up observer if there are more messages to load
    if (!hasMore && isLoading) return;
    const spinnerElement = spinner.current;

    const observer = new IntersectionObserver(
      (entries) => {
        // Check if the button is fully visible and not already loading
        if (entries[0]?.isIntersecting && !isLoading) {
          loadMoreMessages();
          setIsLoading(true);
        }
      },
      { threshold: 1.0 },
    );

    if (spinnerElement) {
      observer.observe(spinnerElement);
    }

    return () => {
      if (spinnerElement) {
        observer.unobserve(spinnerElement);
      }
    };
  }, [hasMore, loadMoreMessages, isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col-reverse gap-2 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <ChatMessage
          chatMembersLength={chatMembersLength}
          messages={messages}
          message={message}
          username={username}
          isCurrentUser={username === message.user.username}
          isGroupChat={isGroupChat}
          key={index}
          isMobile={isMobile}
        />
      ))}

      {hasMore && (
        <div className="relative pt-2 df">
          <div className="loader" ref={spinner}></div>
        </div>
      )}
    </div>
  );
}
