import React, { useState, useCallback} from 'react'
import { forgotPassword, newPassword } from './../../fetch/authentication/auth'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState(useParams().token);
    const [password, setPassword] = useState('|#]qQ,DKxysBJ#ph');
    const [confirmPassword, setConfirmPassword] = useState('|#]qQ,DKxysBJ#ph');

    let navigate = useNavigate();
    const notify = useCallback(async (msg: string) => {
        toast(msg, { position: "top-center", autoClose: 10000, hideProgressBar: true, type: "warning" });
    }, []);

    const onForgotPassword = useCallback(async function () {
        try{
            await forgotPassword(email);
            notify(`E-mail com link de alteração de senha foi enviado para ${email}`);
            setTimeout(() => navigate('/'), 10000);            
        } catch (err: any) {
            notify(err.message);
        }        
    }, [email]);


    const onNewPassword = useCallback(async function () {
        try{
            if (!token) return;
            await newPassword(password, token);
            notify(`Senha alterada com sucesso!`);
            setTimeout(() => navigate('/'), 10000);            
        } catch (err: any) {
            notify(err.message);
        }        
    }, [email]);    

    return <>{ 
        !token ? 
        <div>
            <p>Para recuperar sua senha, é necessário que você preencha o e-mail que você utilizou para cadastrar no nosso site no campo abaixo</p>
            <br/>
            <br/>
            <p>E-mail</p>
            <input type={'text'} onChange={(res: any) => setEmail(res.target.value)} />
            <br/>
            <br/>
            <button onClick={onForgotPassword}>Confirmar</button>            
        </div> : 
        <div>
            <p>Senha *</p>
            <input type={'text'} onChange={(res: any) => setPassword(res.target.value)} />

            <p>Confirmar Senha *</p>
            <input type={'text'} onChange={(res: any) => setConfirmPassword(res.target.value)} />
            
            <button onClick={onNewPassword}>Confirmar</button>
        </div>

    }<ToastContainer style={{color: 'red'}}/></>
}

export { ForgotPassword };