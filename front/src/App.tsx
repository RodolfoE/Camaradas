import React, { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/login/login'
import PrimarySearchAppBar from './pages/home/home'
import { checkAuth, checkFacebookAuth } from './fetch/authentication/auth'
import { useNavigate } from "react-router-dom";
import { Header } from './pages/header/header'
import Product from './pages/product/crud/product'
import ProductList from './pages/product/crud/list'

import { connect } from 'react-redux'
import { startLogin, finishLogin, setUser } from './redux/userSlice'

function App({ dispatch }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkIsAuth();
  }, [])

  const checkIsAuth = useCallback(async () => {
    setIsLoading(true);  
    dispatch(startLogin());

    const [fb, local] : any = await Promise.all([
      checkFacebookAuth().catch(() => -1),
      checkAuth().catch(() => -1)
    ])
    
    if (fb !== -1)
      dispatch(setUser(fb));
    else if (local !== -1)
      dispatch(setUser(local));
    
    setIsAuthenticated(![fb, local].every(x => x === -1));
    setIsLoading(false);  
    dispatch(finishLogin());
  }, [])

  return (
    <div className="App">
       <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
          <Route path="/login/register/:token" element={!isAuthenticated ? <Login tokenType='register' setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
          <Route path="/login/forgotPassword/:token" element={!isAuthenticated ? <Login tokenType='forgotPassword' setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" /> }/>
          <Route path='' element={<PrimarySearchAppBar isLoading={isLoading}/>}>
            <Route index path='crud/product' element={<Product/>}/>
            <Route index path='crud/product/:id' element={<Product/>}/>
            <Route index path='crud/product/list' element={<ProductList/>}/>
          </Route>
        </Routes>
    </BrowserRouter>
    </div>
  );
}

    
const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user } }: any) => ({ isAuthenticated, isFetching, user })
export default connect(mapStateToProps)(App)
