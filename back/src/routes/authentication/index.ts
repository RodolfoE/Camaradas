import express from 'express';
const authRouter = express.Router();
import jwt from "jsonwebtoken";

import { getUserByNameOrEmail, saveUser, getUserByUserId, updateUser, updateUserPassword } from './../../fetch';
import { hashPassword, comparePassword, sendRegistration, sendForgotPassword } from './../../services';
import { standardErrorTreatment } from '../../helpers/errorTreatment'
import { localRegistration, facebookRegistration } from './controller'
import { isAuthenticated } from '../base/base'

const isPasswordValid = async (user: string, plaintextPassword: string, hashedPassword: string) =>
    await comparePassword(plaintextPassword, hashedPassword as string)

authRouter.post('/login', async function(req: any, res: any, next: any) {
    const { username, password } = req.body;
    
    const fetchedUser = await getUserByNameOrEmail(req.pool, username, username);

    if (!fetchedUser || !await isPasswordValid(fetchedUser.username, password, fetchedUser.password)) {
        res.sendStatus(401)
        return;
    }

    if (fetchedUser.active === 0){
        const mailToken = jwt.sign({ user_id: fetchedUser.user_id, privilege: fetchedUser.privilege }, process.env.JWT_KEY, {
            algorithm: "HS256",
            expiresIn: Number(process.env.JWT_REGISTRATION_EXPIRE),
        });
    
        sendRegistration(fetchedUser.username, fetchedUser.email, mailToken);
        res.sendStatus(403)
        return;
    }
    
    const token = jwt.sign({ ...fetchedUser, password: ''}, process.env.JWT_KEY, {
		algorithm: "HS256",
		expiresIn: Number(process.env.JWT_EXPIRE),
	})
    
    const refreshToken = jwt.sign({ ...fetchedUser, password: ''}, process.env.JWT_REFRESH_KEY, {
		algorithm: "HS256",
		expiresIn: Number(process.env.JWT_REFRESH_EXPIRE),
	})

	res.cookie("token", token, { maxAge: Number(process.env.JWT_EXPIRE) * 1000 })
    res.cookie("refreshToken", refreshToken, { maxAge: Number(process.env.JWT_REFRESH_EXPIRE) * 1000 })
	res.send({ ...fetchedUser, password: ''});
});

authRouter.get('/forgotPassword/:email', async (req: any, res: any, next: any) => {
    const { email } = req.params;
    const fetchedUser = await getUserByNameOrEmail(req.pool, '', email);
    if (!fetchedUser){
        res.sendStatus(401)
        return;
    }
    const mailToken = jwt.sign({ user_id: fetchedUser.user_id, privilege: fetchedUser.privilege }, process.env.JWT_KEY, {
        algorithm: "HS256",
        expiresIn: Number(process.env.JWT_REGISTRATION_EXPIRE),
    });

    sendForgotPassword(fetchedUser.username, fetchedUser.email, mailToken);
    res.sendStatus(200)
});

authRouter.post('/newPassword', async (req: any, res: any, next: any) => {
    const { password, token } = req.body;    
    if (!jwt.verify(token, process.env.JWT_KEY)){
        res.sendStatus(401);
        return;
    }
    const { user_id } = jwt.decode(token, process.env.JWT_KEY);
    await updateUserPassword(req.pool, { user_id, password: await hashPassword(password) });
    res.sendStatus(200)
})


authRouter.post('/register', async (req: any, res: any, next: any) => {
    try{
        const { id, username, password, email, stretegy } = req.body;
        
        switch(stretegy){
            case 'facebook':
                await facebookRegistration(req.pool, { id, username, email, stretegy })    
                break;
            default:
                await localRegistration(req.pool, { username, password, email });
                break;
        }

        res.sendStatus(200);
    } catch (err) {
        standardErrorTreatment(res, err);
    }
})

authRouter.get('/validatetoken/:token', async (req: any, res: any, next: any) => {
    const { token: access_token } = req.params;

    if (!jwt.verify(access_token, process.env.JWT_KEY)){
        res.sendStatus(498)
        return;
    }
    const user = jwt.decode(access_token, process.env.JWT_KEY);
    const fetchedUser = await getUserByUserId(req.pool, user.user_id);
    await updateUser(req.pool, { ...fetchedUser, active: 1, password: '' });

    const token = jwt.sign({ ...fetchedUser, active: 1, password: ''}, process.env.JWT_KEY, {
		algorithm: "HS256",
		expiresIn: Number(process.env.JWT_EXPIRE),
	})
    
    const refreshToken = jwt.sign({ ...fetchedUser, password: ''}, process.env.JWT_REFRESH_KEY, {
		algorithm: "HS256",
		expiresIn: Number(process.env.JWT_REFRESH_EXPIRE),
	})

	res.cookie("token", token, { maxAge: Number(process.env.JWT_EXPIRE) * 1000 })
    res.cookie("refreshToken", refreshToken, { maxAge: Number(process.env.JWT_REFRESH_EXPIRE) * 1000 })
	res.send({ success: true })
})

authRouter.get('/checkAuth', isAuthenticated, (req: any, res: any, next: any) => {
    const { refreshToken } = req.cookies || req.header;
    const { user_id, privilege, username, email } = jwt.decode(refreshToken, process.env.JWT_KEY);
    res.send({ user_id, privilege, username, email });
})

export { authRouter, isAuthenticated };
