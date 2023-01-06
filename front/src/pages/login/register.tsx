import React, { useState, useCallback, useEffect } from 'react'

import { ToastContainer, toast } from 'react-toastify';
import { sanitizeInput, INPUT_TYPE } from './../../services'
import { postRegister } from './../../fetch' 

const Register = () => {
    const [username, setUsername] = useState('Rodolfo');
    const [password, setPassword] = useState('|#]qQ,DKxysBJ#ph');
    const [confirmPassword, setConfirmPassword] = useState('|#]qQ,DKxysBJ#ph');
    const [email, setEmail] = useState('rodolfo@gmail.com');
    const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);

    const onRegistrar = useCallback(async () => {
        try {
            sanitizeInput(INPUT_TYPE.REGISTER)({username, password, confirmPassword, email});
            await postRegister({username, password, confirmPassword, email});
            toast(`Foi enviado um e-mail de confirmação para ${email}\nO prazo para confirmar é de 24hrs`, { position: "top-center", autoClose: 5000, hideProgressBar: true, type: "info" });
            setSubmitBtnDisabled(true);
        } catch (errorMsg: any) {
            toast(errorMsg.message, { position: "top-center", autoClose: 5000, hideProgressBar: true, type: "warning" });            
        }
    }, [username, password, email])

    return <div>
            <h1>Registrar-se</h1>

            <p>Nome do Usuário *</p>
            <input type={'text'} onChange={(res: any) => setUsername(res.target.value)} />

            <p>E-mail *</p>
            <input type={'text'} onChange={(res: any) => setEmail(res.target.value)} />

            <p>Senha *</p>
            <input type={'text'} onChange={(res: any) => setPassword(res.target.value)} />

            <p>Confirmar Senha *</p>
            <input type={'text'} onChange={(res: any) => setConfirmPassword(res.target.value)} />

            <button disabled={submitBtnDisabled} onClick={onRegistrar}>Registrar</button>

            <ToastContainer style={{color: 'red'}}/>
        </div>
}

export { Register };