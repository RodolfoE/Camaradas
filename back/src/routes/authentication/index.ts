import express from 'express';
const authRouter = express.Router();
import jwt from "jsonwebtoken";

import { getUserByNameOrEmail, saveUser } from './../../fetch';
import { hashPassword, comparePassword } from './../../services';
import { privileges } from '../../helpers/consts'
import passwordValidator from 'password-validator';
import emailValidator from 'email-validator';


const isPasswordValid = async (user: string, plaintextPassword: string, hashedPassword: string) =>
    await comparePassword(plaintextPassword, await hashPassword(hashedPassword) as string)

authRouter.post('/login', async function(req: any, res: any, next: any) {
    const { user, password } = req.body;
    
    const fetchedUser = await getUserByNameOrEmail(req.pool, user, user);

    if (!fetchedUser || !await isPasswordValid(fetchedUser.username, password, fetchedUser.password)) {
        res.sendStatus(403)
        return;
    }        
    
    const token = jwt.sign({ ...fetchedUser, password: ''}, process.env.JWT_KEY, {
		algorithm: "HS256",
		expiresIn: Number(process.env.JWT_EXPIRE),
	})

	res.cookie("token", token, { maxAge: Number(process.env.JWT_EXPIRE) * 1000 })
	res.end()
});

authRouter.post('/register', async (req: any, res: any, next: any) => {
    const { username, password, email } = req.body;
    if (await getUserByNameOrEmail(req.pool, username, email)){
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
    
    await saveUser(req.pool, { ...user, privileges: admin && admin !== -1 ? knownAdmins?.length && knownAdmins[admin].split(';')[0] || 1 : 2});
    res.sendStatus(200);
    
})

const isAuthenticated = (req: any, res: any, next: any) => {
    const { token } = req.cookies || req.header;
    if (!jwt.verify(token, process.env.JWT_KEY)){
        res.sendStatus(498)
        return;
    }
    next();
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

export { authRouter, isAuthenticated };
