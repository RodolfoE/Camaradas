import express from 'express';
const authRouter = express.Router();
import jwt from "jsonwebtoken";

import { getUserByNameOrEmail, saveUser, getUserByUserId, updateUser, updateUserPassword } from './../../fetch';
import { hashPassword, comparePassword, sendRegistration, sendForgotPassword } from './../../services';
import { privileges } from '../../helpers/consts'
import passwordValidator from 'password-validator';
import emailValidator from 'email-validator';

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
	res.sendStatus(200)
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
        const { username, password, email } = req.body;
        if ((!username || !email) && await getUserByNameOrEmail(req.pool, username, email)){
            res.sendStatus(409);
            return;
        }
    
        var schema = new passwordValidator();
        schema
            .is().min(8)                                    // Minimum length 8
            .is().max(100)                                  // Maximum length 100
        
        if (process.env.PRODUCTION)
            schema.has().uppercase()                              // Must have uppercase letters
                .has().lowercase()                              // Must have lowercase letters
                .has().digits(2)                                // Must have at least 2 digits
                .has().not().spaces()                           // Should not have spaces
                .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
            
        if (!emailValidator.validate(email) || !schema.validate(password)){
            res.sendStatus(401);
            return;
        }            
    
        const user = {
            username,
            password: await hashPassword(password),
            email
        }
    
        const knownAdmins = process.env.KNOWN_ADMIN?.split(',');
        const admin = knownAdmins?.indexOf(username);
        
        const privilege = admin && admin !== -1 ? knownAdmins?.length && knownAdmins[admin].split(';')[0] || 1 : 2
        const { user_id } = await saveUser(req.pool, { ...user, active: 0, privilege});
        
        const mailToken = jwt.sign({ user_id, privilege }, process.env.JWT_KEY, {
            algorithm: "HS256",
            expiresIn: Number(process.env.JWT_REGISTRATION_EXPIRE),
        });
    
        sendRegistration(username, email, mailToken);
        res.sendStatus(200);    
    } catch (err) {
        res.sendStatus(500);
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

const isAuthenticated = (req: any, res: any, next: any) => {
    try {
        const { token, refreshToken } = req.cookies || req.header;
        if (!token || !jwt.verify(token, process.env.JWT_KEY)){
            if (jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY)){
                const { user_id, privilege, username, email } = jwt.decode(refreshToken, process.env.JWT_KEY);
                const token = jwt.sign({ user_id, privilege, username, email }, process.env.JWT_KEY, {
                    algorithm: "HS256",
                    expiresIn: Number(process.env.JWT_EXPIRE),
                });
                res.cookie("token", token, { maxAge: Number(process.env.JWT_EXPIRE) * 1000 })
            } else 
                res.sendStatus(498)
        }    
        next();
    } catch (err) {
        res.sendStatus(498)
    }
}

const hasPermission = (permissionLevel: number) => (req: any, res: any, next: any) => {
    const { token } = req.cookies || req.header;
    const user = jwt.decode(token, process.env.JWT_KEY)
    const currentUserPrivilege = privileges.find(p => p.role === user.privilege)
    if (currentUserPrivilege?.level > permissionLevel){
        res.sendStatus(403)
        return;
    }
    next();
}

authRouter.get('/checkAuth', isAuthenticated, (req: any, res: any, next: any) => res.sendStatus(200))

export { authRouter, isAuthenticated, hasPermission };
