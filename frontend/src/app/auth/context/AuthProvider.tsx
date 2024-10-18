import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { LoginJwtPayload } from '../../interfaces/LoginJwtPayload';
import { toast } from 'react-toastify';

interface AuthContextValues {
  login: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValues | undefined>(undefined);

export interface User extends JwtPayload {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('token') !== null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const login = useCallback(
    (newToken: string) => {
      setIsLoggedIn(true);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      navigate('/');
    },
    [navigate],
  );

  const checkTokenExpiration = useCallback(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<LoginJwtPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && currentTime > decodedToken.exp) {
          toast.info('Your session has expired. Please log in again.');
          logout();
        }
      } catch (error) {
        toast.info('You were logged out due to security reasons');
        logout();
      }
    }
  }, [token, logout]);

  // check token every 5 mins
  useEffect(() => {
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 300000);
    return () => clearInterval(intervalId);
  }, [checkTokenExpiration]);

  // set the user state
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<User>(token);
        setUser(decodedToken);
      } catch (error) {
        toast.error('An error occurred. Please log in again.');
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token, logout]);

  const contextValue = useMemo(
    () => ({
      login,
      logout,
      isLoggedIn,
      token,
      user,
    }),
    [login, logout, isLoggedIn, token, user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
