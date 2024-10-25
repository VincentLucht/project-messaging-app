import { DBChat } from '../../../interfaces/databaseSchema';

interface ChatCardProps {
  chat: DBChat;
}

export default function ChatCard({ chat }: ChatCardProps) {
  return (
    <div>
      <div>{chat.name}</div>
    </div>
  );
}
