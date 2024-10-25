import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Login from '@/app/auth/login/Login';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import Home from '@/app/middle/Home/Home';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const API_URL = 'http://localhost:3005';

export default function App() {
  const { isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      logout();
    }
  }, [isLoggedIn, logout]);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Home />} />
      </Routes>

      <ToastContainer theme="dark" position="top-center" />
    </div>
  );
}
