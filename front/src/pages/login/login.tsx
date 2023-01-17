import React, { useState, useCallback, useEffect} from 'react'
import { postLogin, loginWithFacebook } from './../../fetch/authentication/auth'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import './style.scss';
import face from './img/download.jpg'
import { useParams } from 'react-router-dom';
import { forgotPassword, newPassword } from './../../fetch/authentication/auth'
import { sanitizeInput, INPUT_TYPE } from './../../services'
import { postRegister } from './../../fetch' 
import { Loading } from './../../component/loading/loading'
import { connect } from 'react-redux'
import { startLogin, finishLogin, setUser } from '../../redux/userSlice'
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';


const Login = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(useParams().token);
    const [email, setEmail] = useState('');

    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmRegisterPassword, setRegisterConfirmPassword] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false);    

    const [forgotPasswordToken, setForgotPasswordToken] = useState('');
    const [forgotConfirmPasswordToken, setForgotConfirmPasswordToken] = useState('');
    let navigate = useNavigate();

    const onRegistrar = useCallback(async () => {
        try {
            sanitizeInput(INPUT_TYPE.REGISTER)({username: registerUsername, password: registerPassword, confirmPassword: confirmRegisterPassword, email: registerEmail});
            await postRegister({username: registerUsername, password: registerPassword, confirmPassword: confirmRegisterPassword, email: registerEmail});
            toast(`Foi enviado um e-mail de confirmação para ${email}\nO prazo para confirmar é de 24hrs`, { position: "top-center", autoClose: 5000, hideProgressBar: true, type: "info" });
            setSubmitBtnDisabled(true);
        } catch (errorMsg: any) {
            toast(errorMsg.message, { position: "top-center", autoClose: 5000, hideProgressBar: true, type: "warning" });            
        }
    }, [registerUsername, registerPassword, registerEmail, confirmRegisterPassword])

    const notify = useCallback(async (msg: string) => {
        toast(msg, { position: "top-center", autoClose: 10000, hideProgressBar: true, type: "warning" });
    }, []);

    const login = useCallback(async function (stretegy: string) {
        dispatch(startLogin());
        try{
            switch(stretegy){
                case 'facebook':
                    await loginWithFacebook();                    
                    break;
                case 'local':
                    dispatch(setUser(await postLogin(username, password)));
                    break;
            }
            navigate('/');
        } catch (err: any) {
            notify(err.message);
        } finally {
            dispatch(finishLogin());
        }
    }, [username, password]);

    const onNewPassword = useCallback(async function () {
        try{
            if (!token) return;
            sanitizeInput(INPUT_TYPE.CHECK_PASSWORD)({password: forgotPasswordToken, confirmPassword: forgotConfirmPasswordToken})
            await newPassword(forgotPasswordToken, token);
            notify(`Senha alterada com sucesso!`);
            setTimeout(() => navigate('/'), 10000);
        } catch (err: any) {
            notify(err.message);
        }        
    }, []);

    useEffect(() => {
        if (token && tokenType === 'register')
            fetch(`/authentication/validatetoken/${token}`).then(() => {
                setTimeout(() => navigate('/'), 10000);
            });
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

    const renderTokenView = () => {
        return tokenType === 'forgotPassword' ? 
            <>
            
            <div className='form'>
                <div className="input-group">
                    <input type="password" name="registerLoginPassword" id="registerLoginPassword" required onChange={(res: any) => setForgotPasswordToken(res.target.value)} />
                    <label htmlFor="registerLoginPassword">Senha *</label>
                </div>

                <div className="input-group">
                    <input type="password" name="regConfPass" id="regConfPass" required onChange={(res: any) => setForgotConfirmPasswordToken(res.target.value)} />
                    <label htmlFor="regConfPass">Confirmar Senha *</label>
                </div>
                
                <button className="submit-btn"  onClick={onNewPassword}>Confirmar</button>
            </div>
            </>
            :
            <h2>Validando token...</h2>
    }

    return <>
    {
        isAuthenticated ? '' :
        <Loading isLoading={isLoading} withNavDraw={false}>
            <div className="login-wrapper">
            {
                !token ? 
                <div>
            <div className='form'>
            <img src={face} alt=""/>
            <h2>Login</h2>
            <div className="input-group">
                <input type="text" name="loginUser" id="loginUser" autoComplete="off" required onChange={(res: any) => setUsername(res.target.value)}/>
                <label htmlFor="loginUser">Usuário</label>
            </div>
            <div className="input-group">
                <input type="password" name="loginPassword" id="loginPassword" required onChange={(res: any) => setPassword(res.target.value)}/>
                <label htmlFor="loginPassword">Senha</label>
            </div>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <LoadingButton classes={ { loading: 'loadingBtnPrimary' } } size="small" color="primary" onClick={login.bind(this, 'local')} loading={isFetching} variant="contained" >
                    <span>Login</span>
                </LoadingButton>
            </Box>
            <a href="#register-pw" className="forgot-pw">Registrar</a>
            <br/><br/>
            <a href="#forgot-pw" className="forgot-pw">Esqueceu a senha?</a>
            <br/><br/>

            <button style={{cursor: 'pointer'}} onClick={login.bind(this, 'facebook')}   className="loginBtn loginBtn--facebook">Login com Facebook</button>        
            
            </div>
            <div id="forgot-pw">
                <div className="form">
                    <a href="#" className="close">&times;</a>
                    <h2>Para recuperar sua senha, é necessário que você preencha o e-mail que você utilizou para cadastrar no nosso site no campo abaixo</h2>
                    <div className="input-group">
                    <input type="email" name="forgotEmail" id="forgotEmail" required onChange={(res: any) => setEmail(res.target.value)} />
                    <label htmlFor="forgotEmail">Email</label>
                    </div>
                    <LoadingButton classes={ { loading: 'loadingBtnPrimary' } } style={{ float: 'right' }} size="small" color="primary" onClick={onForgotPassword} loading={isFetching} variant="contained" >
                        <span>Confirmar</span>
                    </LoadingButton>
                </div>
            </div>

            <div id="register-pw">
                <div className="form">
                    <a href="#s" className="close">&times;</a>
                    <h2>Registrar-se</h2>

                    <div className="input-group">
                        <input type="text" name="registerUserName" id="registerUserName" required onChange={(res: any) => setRegisterUsername(res.target.value)} />
                        <label htmlFor="registerUserName">Nome do Usuário *</label>
                    </div>

                    <div className="input-group">
                        <input type="text" name="registerEmail" id="registerEmail" required onChange={(res: any) => setRegisterEmail(res.target.value)} />
                        <label htmlFor="registerEmail">E-mail *</label>
                    </div>

                    <div className="input-group">
                        <input type="password" name="registerLoginPassword" id="registerLoginPassword" required onChange={(res: any) => setRegisterPassword(res.target.value)} />
                        <label htmlFor="registerLoginPassword">Senha *</label>
                    </div>

                    <div className="input-group">
                        <input type="password" name="regConfPass" id="regConfPass" required onChange={(res: any) => setRegisterConfirmPassword(res.target.value)} />
                        <label htmlFor="regConfPass">Confirmar Senha *</label>
                    </div>
                    <LoadingButton disabled={submitBtnDisabled} classes={ { loading: 'loadingBtnPrimary' } } style={{ float: 'right' }} size="small" color="primary" onClick={onRegistrar} loading={isFetching} variant="contained" >
                        <span>Registrar</span>
                    </LoadingButton>
                </div>
            </div>
            <ToastContainer style={{color: 'red'}}/>
            </div> : renderTokenView()
            }            
        </div>
    </Loading>
    }
    </>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user } }: any) => ({ isAuthenticated, isFetching, user })
export default connect(mapStateToProps)(Login)