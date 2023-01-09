import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from './pages/login/login'
import { Register } from './pages/login/register'
import { Home } from './pages/home/home'
import { checkAuth, checkFacebookAuth } from './fetch/authentication/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkIsAuth();
  }, [])
  
  const checkIsAuth = useCallback(async () => {
    try {
      await Promise.any([
        checkFacebookAuth(),
        checkAuth()
      ]);      
      
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }    
  }, [])

  return (
    <div className="App">
     <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" /> }/>
        <Route path="/login/register/:token" element={!isAuthenticated ? <Login tokenType='register' setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
        <Route path="/login/forgotPassword/:token" element={!isAuthenticated ? <Login tokenType='forgotPassword' setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
        <Route path='/' element={<Home />}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
