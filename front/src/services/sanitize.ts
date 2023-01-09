export const INPUT_TYPE = {
    REGISTER: 1,
    CHECK_PASSWORD: 2
}

const checkPassword = ({ password, confirmPassword } : any) => {
    if (password !== confirmPassword)
        throw new Error("Campos de senha devem ser iguais")
}

const register = ({username, password, confirmPassword, email} : any) => {
    if (!username || !password || !email)
        throw new Error("Campos obrigatórios não preenchidos")
    
    checkPassword({password, confirmPassword})
}

export const sanitizeInput = (type: number) => (input: any) => {
    switch(type){
        case INPUT_TYPE.REGISTER:
            register(input);
        break;
        case INPUT_TYPE.CHECK_PASSWORD:
            checkPassword(input);
        break;
    }
}