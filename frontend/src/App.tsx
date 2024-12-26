import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Login from '@/app/auth/login/Login';
import SignUp from '@/app/auth/sign-up/SignUp';
import { useAuth } from '@/app/auth/context/hooks/useAuth';

import Home from '@/app/middle/Home/Home';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const API_URL = 'http://localhost:3005';

export default function App() {
  const { isLoggedIn, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn && location.pathname !== '/sign-up') {
      logout();
    }
  }, [isLoggedIn, logout, location.pathname]);

  return (
    <div className="mx-auto max-w-[1600px] cursor-default select-none">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/*" element={<Home />} />
      </Routes>

      <ToastContainer theme="dark" position="bottom-left" />
    </div>
  );
}
