import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Login from './app/auth/login/Login';
import { useAuth } from './app/auth/context/hooks/useAuth';

import Home from './app/middle/Home/Home';
import Chat from './app/right/ActiveChat/Chat';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const API_URL = 'http://localhost:3005';

export default function App() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Chat />} />
        </Routes>
      </main>

      <footer></footer>

      <ToastContainer theme="dark" position="top-center" />
    </div>
  );
}
