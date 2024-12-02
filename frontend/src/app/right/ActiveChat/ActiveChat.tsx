import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { Socket } from 'socket.io-client';

import { DBChatWithMembers } from '@/app/middle/AllChatsList/api/fetchAllUserChats';
import { DBMessageWithUser } from '@/app/interfaces/databaseSchema';

import handleNewMessages from '@/app/right/ActiveChat/service/handleNewMessage';
import handleUserJoiningChat from '@/app/right/ActiveChat/service/handleUserJoiningChat';
import handleFetchingMessages from '@/app/right/ActiveChat/service/handleFetchingMessages/handleFetchingMessages';
import handleUnmount from '@/app/right/ActiveChat/service/handleUnmount';

import ChatHeader from '@/app/right/ActiveChat/components/ChatHeader/ChatHeader';
import ChatSettings from '@/app/right/ActiveChat/components/ChatSettings/ChatSettings';
import AllChatMessages from '@/app/right/ActiveChat/components/AllChatMessages/AllChatMessages';
import SendMessageForm from '@/app/right/ActiveChat/components/ChatMessageForm/SendMessageForm';

import { toast } from 'react-toastify';
import { TypingUsers } from '@/app/interfaces/TypingUsers';

interface ActiveChatProps {
  chat: DBChatWithMembers;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
  userId: string;
  username: string;
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
  userId,
  username,
  token,
  socket,
  typingUsers,
  isMobile,
}: ActiveChatProps) {
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [messages, setMessages] = useState<DBMessageWithUser[]>([]);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // socket events for active chat
  useEffect(() => {
    if (!socket) return;

    handleUserJoiningChat(socket, chat.id, userId, username, setMessages);

    socket.on('error', (error: string) => {
      toast.error(`Socket error: ${error}`);
    });

    return () => {
      socket.emit('leave-chat', chat.id, username);
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('error');
    };
  }, [socket, chat.id, userId, username]);

  // New Messages
  useEffect(() => {
    handleNewMessages(socket, chat.id, setMessages);

    return () => {
      socket?.off('new-message');
    };
  }, [socket, chat.id, setChats]);

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

  // Reset messages on chat change and avoid re-fetching "cached" data
  useEffect(() => {
    // ! has to check for undefined!
    if (chat.messages && chat.page && chat.hasMore !== undefined) {
      setMessages(chat.messages);
      setMessagePage(chat.page);
      setHasMore(chat.hasMore);
    } else {
      setMessages([]);
      setMessagePage(1);
      setHasMore(true);
      loadInitialMessages();
    }
  }, [chat.id, chat.hasMore, chat.messages, chat.page, loadInitialMessages]);

  // Save current messages state to chat before unmounting
  useEffect(() => {
    return () => {
      handleUnmount(setChats, chat.id, messages, messagePage, hasMore);
    };
  }, [chat.id, messages, messagePage, hasMore, setChats]);

  return (
    <div
      className={`${showChatSettings ? 'grid grid-cols-[5.5fr_4.5fr] md:grid-cols-[0%_100%]' : ''}`}
    >
      <div className="grid h-[100dvh] grid-rows-[auto_1fr_auto] border-l">
        <ChatHeader
          showChatSettings={showChatSettings}
          setShowChatSettings={setShowChatSettings}
          typingUsers={typingUsers}
          chatId={chat.id}
          chatName={chat.name}
          username={username}
          isGroupChat={chat.is_group_chat}
          lastChatMessage={chat.last_message}
        />

        {/* TODO: Actually style this! */}
        <hr />

        <AllChatMessages
          messages={messages}
          chatMembersLength={chat.UserChats.length}
          username={username}
          loadMoreMessages={loadMoreMessages}
          hasMore={hasMore}
        />

        {/* TODO: Actually style this */}
        <hr />

        <SendMessageForm
          socket={socket}
          chatId={chat.id}
          chatName={chat.name}
          userId={userId}
          username={username}
        />
      </div>

      <ChatSettings
        setShowChatSettings={setShowChatSettings}
        showChatSettings={showChatSettings}
        chat={chat}
        userId={userId}
        username={username}
        token={token}
        socket={socket}
      />
    </div>
  );
}
