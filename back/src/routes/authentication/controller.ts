import passwordValidator from 'password-validator';
import emailValidator from 'email-validator';
import { getUserByNameOrEmail, saveUser } from './../../fetch';
import { hashPassword, sendRegistration } from './../../services';
import jwt from "jsonwebtoken";

const localRegistration = async (pool: any, newUser) => {
    const { username, password, email } = newUser;
    if ((!username || !email) && await getUserByNameOrEmail(pool, username, email))
        throw { messege: 'Usuário já existe ou nenhum parametro enviado', statusCode: 409, customError: true }

    var schema = new passwordValidator();
    schema
        .is().max(100)                                  // Maximum length 100
    
    if (process.env.PRODUCTION)
        schema.has().uppercase()                              // Must have uppercase letters
            .is().min(8)                                    // Minimum length 8    
            .has().lowercase()                              // Must have lowercase letters
            .has().digits(2)                                // Must have at least 2 digits
            .has().not().spaces()                           // Should not have spaces
            .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
        
    if (!emailValidator.validate(email) || !schema.validate(password))
        throw { messege: 'Senha fraca', statusCode: 412, customError: true }

    const user = {
        username,
        password: await hashPassword(password),
        email
    }

    const knownAdmins = process.env.KNOWN_ADMIN?.split(',');
    const admin = knownAdmins?.indexOf(username);
    
    const privilege = admin && admin !== -1 ? knownAdmins?.length && knownAdmins[admin].split(';')[0] || 1 : 2
    const { user_id } = await saveUser(pool, { ...user, active: 0, privilege});
    
    const mailToken = jwt.sign({ user_id, privilege }, process.env.JWT_KEY, {
        algorithm: "HS256",
        expiresIn: Number(process.env.JWT_REGISTRATION_EXPIRE),
    });

    sendRegistration(username, email, mailToken);
}

const facebookRegistration = async (pool, newUser) => {
    const { id, username, email } = newUser;
    if ((!username || !email))
        throw { messege: 'Nenhum parametro enviado', statusCode: 409, customError: true }

    if (!await getUserByNameOrEmail(pool, username, email))
        await saveUser(pool, { id, username, active: 1, privilege: 2, streategy: 'facebook'});
}

export { localRegistration, facebookRegistration }