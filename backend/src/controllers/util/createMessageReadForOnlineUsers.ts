export default async function createMessageReadForOnlineUsers(
  activeChatMembers: Map<string, { username: string; userId: string }>,
  username: string,
  chatId: string,
  db: any,
) {
  if (activeChatMembers) {
    const activeChatMemberIds: string[] = [];

    activeChatMembers.forEach(({ username: memberUsername, userId }) => {
      if (memberUsername !== username) {
        activeChatMemberIds.push(userId);
      }
    });

    await db.messageRead.userReadAllMessages(chatId, activeChatMemberIds);
  }
}
