import { useState } from 'react';

export default function JoinChat() {
  const [joinRoomName, setJoinRoomName] = useState('');

  return (
    <div>
      <form className="mt-8 flex-col gap-4 df">
        <label htmlFor="room-name">Enter the Room name:</label>
        <input
          type="text"
          value={joinRoomName}
          onChange={(e) => setJoinRoomName(e.target.value)}
          required
        />

        <button type="submit" className="rounded-md border p-2">
          Join Room
        </button>

        <button></button>
      </form>
    </div>
  );
}
