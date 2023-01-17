import { baseFetch } from "../baseFetch";
declare global {
    interface Window {
        FB:any;
    }
}
export const newPassword = async (password: string, token: string) => {
    const response = await baseFetch(`/authentication/newPassword`, { password, token }, 'POST')
    if (response.status === 401)
        throw new Error('Nice try, hacker');
}

export const forgotPassword = async (email: string) => {
    const response = await baseFetch(`/authentication/forgotPassword/${email}`, undefined, 'GET')
    if (response.status === 401)
        throw new Error('E-mail não encontrado na nossa base de dados');
    
    if (response.status !== 200)
        throw new Error('Ocorreu um erro ao enviar solicitação. Favor relatar o erro no WhatsApp que segue abaixo.');
}

export const postLogin = async (username: string, password: string) => {
    const response = await baseFetch('/authentication/login',{ username, password }, 'POST')
    
    switch(response.status){
        case 401: 
            throw new Error('Usuário ou senha inválidos')
        case 403: 
            throw new Error('Foi enviado um novo e-mail de ativação para esse usuário. Caso não tenha recebido, favor relatar o erro no WhatsApp que segue abaixo.')
        default:
            break;
    }
    return await response.json();
}

export const checkAuth = async () => {
    const response = await baseFetch('/authentication/checkAuth', undefined, 'GET')
    if (response.status !== 200)
        throw new Error('Usuário não Logado');
    return await response.json();
};

export const checkFacebookAuth = async () => {
    return new Promise((resolve: any, reject: any) => {
        window.FB.getLoginStatus(function(response: any) {
            const { status } = response;
            switch(status){
                case 'connected': 
                    resolve(response)
                    break;
                default:
                    reject();
                    break;
            }
        });
    });
}

export const loginWithFacebook = async () => {
    return new Promise((resolve: any, reject: any) => {
        window.FB.login(function(response: any) {
            switch(response.status){
                case 'connected':
                    window.FB.api('/me', async function(response: any) {
                        try{
                            const { id, name, email } = response;
                            await baseFetch('/authentication/register', { id, username: name, email, stretegy: 'facebook' }, 'POST');
                            resolve();
                        } catch(err) {
                            window.FB.logout(() => {})
                            reject({ message: 'Erro ao logar com Facebook' });
                        }
                      });
                break;
                default:
                    window.FB.logout(() => {})
                    reject({ message: 'Erro ao logar com Facebook' });
                break;
            }                
          }, {scope: 'name, id, email'});
    });
}

export const postRegister = async (user: any) => {
    const response = await baseFetch('/authentication/register', user, 'POST')
    if (response.status !== 200){
        switch (response.status){
            case 412:
                throw new Error('A senha deve conter no mínimo 8 caracteres');
            default:
            throw new Error('Erro ao cadastrar novo usuário');
        }
    }
        
}