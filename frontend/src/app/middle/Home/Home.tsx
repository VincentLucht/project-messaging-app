import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/context/hooks/useAuth';
import { JwtPayload } from 'jwt-decode';

import JoinChat from '../JoinChat/JoinChat';
import AllChatsList from '../AllChatsList/AllChatsList';

import NewChat from '../NewChat/NewChat';

export interface User extends JwtPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export default function Home() {
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleChatCreated = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1); // Increment to trigger refresh of chats
    setShowCreateChat(false);
  }, []);

  const { user, token, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user || !token) {
    return <div>You are not logged in</div>;
  }

  return (
    <div className="grid">
      <div>
        <div>
          <button
            className="border p-2"
            onClick={() => setShowCreateChat(!showCreateChat)}
          >
            Create Chat
          </button>

          {showCreateChat && <NewChat onChatCreated={handleChatCreated} />}
        </div>

        <AllChatsList refreshTrigger={refreshTrigger} />
      </div>
      <div></div>
    </div>
  );
}
