import bcrypt from 'bcrypt';

const hashPassword = (plaintextPassword: string) => {
    return new Promise((success, failed) => {
        bcrypt.genSalt(10, (err: any, salt: any) => {
          bcrypt.hash(plaintextPassword, salt, function(err: any, hash: any) {
            if (err)
                failed();
            success(hash)
          });
        })
    });        
}

const comparePassword = async (plaintextPassword: string, hash: string) => 
    await bcrypt.compare(plaintextPassword, hash);

export { hashPassword, comparePassword }