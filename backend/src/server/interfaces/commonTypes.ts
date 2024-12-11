export type ChatRooms = Map<
  string,
  Map<string, { username: string; userId: string }>
>;

export type ActiveChatMembers = Map<
  string,
  { username: string; userId: string }
>;

export type OnlineUsers = Map<string, Set<string>>;
