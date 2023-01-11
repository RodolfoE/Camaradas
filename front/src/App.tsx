import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/login/login'
import PrimarySearchAppBar from './pages/home/home'
import { Header } from './pages/header/header'

function App() {
  

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login /> }/>
          <Route path="/login/register/:token" element={<Login tokenType='register' /> }/>
          <Route path="/login/forgotPassword/:token" element={<Login tokenType='forgotPassword' /> }/>
          <Route path='' element={<PrimarySearchAppBar />}>
            <Route index element={<Header />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
