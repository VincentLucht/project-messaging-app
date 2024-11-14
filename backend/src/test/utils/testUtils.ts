import jwt from 'jsonwebtoken';

export const basicMockUser = {
  id: 'user123',
  name: 'Test User',
  username: 'Test Username',
  email: 'test@example.com',
};

export const basicMockChats = [
  {
    id: 'chat1',
    name: 'Chat 1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'chat2',
    name: 'Chat 2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Utility function to generate VALID token using the secret key
export const generateToken = (userId: string, name: string) => {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  return jwt.sign({ id: userId, name }, secretKey, { expiresIn: '5m' });
};
