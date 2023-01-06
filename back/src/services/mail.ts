'use-strict'
import nodemailer from "nodemailer";
import { concat } from 'urlconcat';

const sendRegistration = async (username: string, email: any, mailToken) => {    
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "379a77f2c72103",
            pass: "b16a71886c6f92"
        }
        });
    
    // send mail with defined transport object
    return transporter.sendMail({
        from: '"Camaradas 👻" <no-reply@camaradas.com>', // sender address
        to:  email, // "bar@example.com, baz@example.com", // list of receivers
        subject: "Confirmar Registro", // Subject line
        html: `<h1>Confirmar registro</h1>
        <h3>Olá ${username}</h3>
        <p>
            Para confirmar o registro no nosso site, é preciso que você click nesse link abaixo. 
        
            <a href="${concat(process.env.BASE_URL, '/register', '/' + mailToken )}">Confirmar Registro</a>
        
            Caso não tenha sido você, desconsidere a mensagem ou aproveite a oportunidade para espalhar a mensagem da suas ideologias
            e busque por algum artigo que lhe interessa.
        
            <a href="${process.env.BASE_URL}">Camaradas</a>
        </p>`, // html body
        });
}

const sendForgotPassword = async (username: string, email: any, mailToken) => {    
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "379a77f2c72103",
            pass: "b16a71886c6f92"
        }
        });
    
    // send mail with defined transport object
    return transporter.sendMail({
        from: '"Camaradas 👻" <no-reply@camaradas.com>', // sender address
        to:  email, // "bar@example.com, baz@example.com", // list of receivers
        subject: "Esqueci Minha Senha", // Subject line
        html: `<h1>Esqueci Minha Senha</h1>
        <h3>Olá ${username}</h3>
        <p>
            Clique no link abaixo para alterar sua senha:
        
            <a href="${concat(process.env.BASE_URL, '/forgotPassword', '/' + mailToken )}">Esqueci Minha Senha</a>
        
            Caso não tenha sido você, desconsidere a mensagem ou aproveite a oportunidade para espalhar a mensagem da suas ideologias
            e busque por algum artigo que lhe interessa.
        
            <a href="${process.env.BASE_URL}">Camaradas</a>
        </p>`, // html body
        });
}

export { sendRegistration, sendForgotPassword }