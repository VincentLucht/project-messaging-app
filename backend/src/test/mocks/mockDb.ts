const mockDB = {
  user: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    getUserByUsername: jest.fn(),
    getUserByUsernameArr: jest.fn(),
  },
  chat: {
    getChatById: jest.fn(),
    getAllChatMembers: jest.fn(),
    createChat: jest.fn(),
    changeChatName: jest.fn(),
    changeDescription: jest.fn(),
    getOwnerById: jest.fn(),
    deleteChat: jest.fn(),
    deleteChatIfEmpty: jest.fn(),
  },
  message: {
    getMessageById: jest.fn(),
    getAllChatMessages: jest.fn(),
    createMessage: jest.fn(),
  },
  messageRead: {
    getUnreadMessagesCount: jest.fn(),
    createMessageRead: jest.fn(),
    userReadAllMessages: jest.fn(),
  },
  userChats: {
    getAllUserChats: jest.fn(),
    isUserInsideChat: jest.fn(),
    addUserToChat: jest.fn(),
    deleteUserFromChat: jest.fn(),
    isUserInsideChatByUsername: jest.fn(),
  },
  chatAdmin: {
    isChatAdminById: jest.fn(),
    isChatAdminByUsername: jest.fn(),
    makeUserAdminById: jest.fn(),
    makeUserAdminByUsername: jest.fn(),
    removeAdminStatus: jest.fn(),
  },
};

export default mockDB;
