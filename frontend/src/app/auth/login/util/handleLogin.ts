import { API_URL } from '../../../../App';

interface LoginResponse {
  token: string;
}

export default async function handleLogin(username: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorObject = (await response.json()) as LoginResponse;
    throw errorObject;
  }

  const token = (await response.json()) as LoginResponse;
  return token;
}
