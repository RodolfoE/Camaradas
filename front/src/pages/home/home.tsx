import React, { useState, useCallback} from 'react'
import { postLogin } from './../../fetch/authentication/auth'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";


const Home = () => {
    return <div>
        <a href={'http://localhost:3000/login'}>Login</a>
        <br/>
        <a href={'http://localhost:3000/forgotPassword'}>Forgot Password</a>
        <br/>
        <a href={'http://localhost:3000/register'}>register</a>
        <br/>
        <a href={'http://localhost:3000/forgotPassword/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJwcml2aWxlZ2UiOiIyIiwiaWF0IjoxNjczMDI0OTkxLCJleHAiOjE2NzMxMTEzOTF9.nbYYj1-qEMKfbDuX6sPoLK_ppBY2Ln2RBaZHEJhuRtI'}>Confirm register</a>
        </div>
}

export { Home };