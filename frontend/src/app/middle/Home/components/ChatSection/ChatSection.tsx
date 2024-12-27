import { Dispatch, SetStateAction, useState, useMemo } from 'react';
import SearchChat from '@/app/middle/Home/components/ChatSection/SearchChat/SearchChat';
import NewChat from '@/app/middle/Home/components/ChatSection/NewChat/NewChat';
import AllChatsList from '@/app/middle/Home/components/ChatSection/AllChatsList/AllChatsList';

import { DBChatWithMembers } from '@/app/middle/Home/components/ChatSection/AllChatsList/api/fetchAllUserChats';
import { TypingUsers } from '@/app/interfaces/TypingUsers';
import { Socket } from 'socket.io-client';
import OpenUserProfileButton from '@/app/left/OpenUserProfileButton';

interface ChatSectionProps {
  chats: DBChatWithMembers[] | null;
  setChats: Dispatch<SetStateAction<DBChatWithMembers[] | null>>;
  activeChat: DBChatWithMembers | null;
  setActiveChat: Dispatch<SetStateAction<DBChatWithMembers | null>>;
  showCreateChat: boolean;
  setShowCreateChat: Dispatch<SetStateAction<boolean>>;
  location: 'home' | 'user';
  setLocation: Dispatch<SetStateAction<'home' | 'user'>>;
  userId: string;
  username: string;
  profilePictureUrl: string | null | undefined;
  typingUsers: TypingUsers;
  socket: Socket | null;
  isMobile: boolean;
}

export default function ChatSection({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  showCreateChat,
  setShowCreateChat,
  location,
  setLocation,
  userId,
  username,
  profilePictureUrl,
  typingUsers,
  socket,
  isMobile,
}: ChatSectionProps) {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [query, setQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!showSearchBar) {
      return chats;
    }

    return chats?.filter((chat) => {
      return chat.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [showSearchBar, query, chats]);

  return (
    <div className={`flex h-full flex-col ${!isMobile ? 'border-x' : ''}`}>
      <div className="bg-blue-500 px-5 py-2">
        <div
          className={`flex items-center justify-between ${showCreateChat ? 'mb-4' : ''}`}
        >
          <h2 className="text-2xl font-extrabold">Chats</h2>

          <div className="gap-4 df">
            <div>
              {/* Search Chat Button */}
              <button
                className="transition-all hover:scale-105 active:scale-95"
                onClick={() => {
                  setShowSearchBar(!showSearchBar);
                  if (showCreateChat) setShowCreateChat(false);
                }}
              >
                <img src="./magnify.svg" alt="search chat icon" />
              </button>
            </div>

            <div>
              {/* Create Chat Button */}
              <button
                className="transition-all hover:scale-105 active:scale-95"
                onClick={() => {
                  setShowCreateChat(!showCreateChat);
                  if (showSearchBar) setShowSearchBar(false);
                }}
              >
                <img src="./newChat.svg" alt="new chat icon" />
              </button>
            </div>

            {isMobile && (
              <div className="origin-center scale-[85%]">
                <OpenUserProfileButton
                  location={location}
                  setLocation={setLocation}
                  imgUrl={profilePictureUrl}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className={`transition-all duration-150 ease-out
            ${showSearchBar ? 'max-h-[1000px] pt-2 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <SearchChat
            showSearchBar={showSearchBar}
            query={query}
            setQuery={setQuery}
          />
        </div>

        <div
          className={`transition-all duration-150 ease-out ${
            showCreateChat
              ? 'max-h-[calc(100vh-150px)] overflow-y-auto opacity-100'
              : 'max-h-0 overflow-hidden opacity-0'
            }`}
        >
          <NewChat
            socket={socket}
            setChats={setChats}
            showCreateChat={showCreateChat}
            setShowCreateChat={setShowCreateChat}
          />
        </div>
      </div>

      <div className="flex h-full flex-col">
        {filteredChats?.length === 0 && query !== '' ? (
          <div className="mt-4 text-center text-lg font-bold">
            No chats found...
          </div>
        ) : (
          <AllChatsList
            chats={filteredChats?.length ? filteredChats : chats}
            setChats={setChats}
            setActiveChat={setActiveChat}
            userId={userId}
            username={username}
            typingUsers={typingUsers}
            activeChat={activeChat}
          />
        )}
      </div>
    </div>
  );
}
