import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Login from './pages/login';
import Profile from './pages/profile';
import Register from './pages/register';
import Home from './pages/home';
import SendMoneyPage from './pages/sendMoney';

const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  return !isAuthenticated ? element : <Navigate to="/profile" />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
        <Route path="/register" element={<PublicOnlyRoute element={<Register />} />} />
        
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/send-money" element={<PrivateRoute element={<SendMoneyPage />} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;