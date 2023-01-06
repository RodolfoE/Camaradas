export const INPUT_TYPE = {
    REGISTER: 1,
}

const register = ({username, password, confirmPassword, email} : any) => {
    if (!username || !password || !email)
        throw new Error("Campos obrigatórios não preenchidos")
    
    if (password !== confirmPassword)
        throw new Error("Campos de senha devem ser iguais")
}

export const sanitizeInput = (type: number) => (input: any) => {
    switch(type){
        case INPUT_TYPE.REGISTER:
            register(input);
    }
}