import React, { useState, useCallback} from 'react'
import { postLogin } from './../../fetch/authentication/auth'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";


const Login = ({
    setIsAuthenticated
}: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    let navigate = useNavigate();
    const notify = useCallback(async (msg: string) => {
        toast(msg, { position: "top-center", autoClose: 10000, hideProgressBar: true, type: "warning" });
    }, []);

    const login = useCallback(async function () {
        try{
            await postLogin(username, password);
            navigate('/');
            setIsAuthenticated(true);
        } catch (err: any) {
            notify(err.message);
        }        
    }, [username, password]);

    return <div>
            <p>Nome do Usuário</p>
            <input type={'text'} onChange={(res: any) => setUsername(res.target.value)} />

            <p>Senha</p>
            <input type={'text'} onChange={(res: any) => setPassword(res.target.value)} />        

            <button onClick={login}>Login</button>
            <br/><br/>
            <a href='/register'>Registrar</a>
            <br/><br/>
            <a href='/forgotPassword'>Esqueci minha senha</a>
            <ToastContainer style={{color: 'red'}}/>
        </div>
}

export { Login };