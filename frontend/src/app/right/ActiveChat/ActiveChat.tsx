import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { Socket } from 'socket.io-client';

import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import useConnectToChat from '@/app/right/ActiveChat/hooks/useConnectToChat';
import useGetNewMessages from '@/app/right/ActiveChat/hooks/useGetNewMessages';
import handleFetchingMessages from '@/app/right/ActiveChat/service/handleFetchingMessages/handleFetchingMessages';
import handleUnmount from '@/app/right/ActiveChat/service/handleUnmount';

import ChatHeader from '@/app/right/ActiveChat/components/ChatHeader/ChatHeader';
import ChatSettings from '@/app/right/ActiveChat/components/ChatSettings/ChatSettings';
import AllChatMessages from '@/app/right/ActiveChat/components/AllChatMessages/AllChatMessages';
import SendMessageForm from '@/app/right/ActiveChat/components/ChatMessageForm/SendMessageForm';

import { TypingUsers } from '@/app/interfaces/TypingUsers';

interface ActiveChatProps {
  chat: DBChatWithMembers;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  userId: string;
  username: string;
  profilePictureUrl: string | null | undefined;
  token: string;
  socket: Socket | null;
  typingUsers: TypingUsers;
  isMobile: boolean;
}

/**
 * Active Chat Component on the right side
 *
 * Allows real time messaging and activity detection
 */
export default function ActiveChat({
  chat,
  setChats,
  setActiveChat,
  userId,
  username,
  profilePictureUrl,
  token,
  socket,
  typingUsers,
  isMobile,
}: ActiveChatProps) {
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [messages, setMessages] = useState<DBMessageWithUser[]>([]);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useConnectToChat(socket, chat.id, userId, username, setMessages);
  useGetNewMessages(socket, chat.id, setMessages);

  const loadInitialMessages = useCallback(() => {
    handleFetchingMessages(
      userId,
      token,
      chat.id,
      1,
      setMessages,
      setChats,
      setHasMore,
    );
  }, [userId, token, chat.id, setChats]);

  const loadMoreMessages = () => {
    if (!hasMore) return;

    const nextPage = messagePage + 1;
    handleFetchingMessages(
      userId,
      token,
      chat.id,
      nextPage,
      setMessages,
      setChats,
      setHasMore,
    );

    setMessagePage(nextPage);
  };

  useEffect(() => {
    // Check if the chat already has cached messages
    if (chat.messages && chat.page && chat.hasMore !== undefined) {
      // Use the cached messages, page, and hasMore
      setMessages(chat.messages);
      setMessagePage(chat.page);
      setHasMore(chat.hasMore);
    } else {
      // If cached messages don't exist, fetch them
      setMessages([]);
      setMessagePage(1);
      setHasMore(true);
      loadInitialMessages(); // re-fetch
    }
  }, [chat.id, loadInitialMessages, chat.hasMore, chat.page, chat.messages]);

  // Save current messages state to chat before unmounting
  useEffect(() => {
    return () => {
      handleUnmount(setChats, chat.id, messages, messagePage, hasMore);
    };
  }, [chat.id, messages, messagePage, hasMore, setChats]);

  return (
    <div
      className={`overflow-hidden
        ${showChatSettings ? 'grid grid-cols-[5.5fr_4.5fr] md:grid-cols-[0%_100%]' : ''}`}
    >
      <div className="grid h-[100dvh] max-w-[100dvw] grid-rows-[auto_1fr_auto]">
        <ChatHeader
          showChatSettings={showChatSettings}
          setShowChatSettings={setShowChatSettings}
          setActiveChat={setActiveChat}
          typingUsers={typingUsers}
          chatId={chat.id}
          chatName={chat.name}
          chatMembers={chat.UserChats}
          userId={userId}
          username={username}
          isGroupChat={chat.is_group_chat}
          lastChatMessage={chat.last_message}
          isMobile={isMobile}
        />

        <hr />

        <AllChatMessages
          messages={messages}
          chatMembersLength={chat.UserChats.length}
          username={username}
          loadMoreMessages={loadMoreMessages}
          hasMore={hasMore}
          isGroupChat={chat.is_group_chat}
          isMobile={isMobile}
        />

        <hr />

        <SendMessageForm
          socket={socket}
          chatId={chat.id}
          chatName={chat.name}
          userId={userId}
          username={username}
          profilePictureUrl={profilePictureUrl}
          isMobile={isMobile}
        />
      </div>

      <div
        className={`z-50
          ${isMobile && showChatSettings ? 'absolute min-h-[100dvh] w-full overflow-y-auto' : ''}`}
      >
        <ChatSettings
          setShowChatSettings={setShowChatSettings}
          showChatSettings={showChatSettings}
          chat={chat}
          userId={userId}
          username={username}
          token={token}
          socket={socket}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
