const getUserByNameOrEmail = async (pool: any, user: string, email: string) => {
    const { rows } = await pool.query(`select * from users where username='${user.toLocaleLowerCase()}' or email='${email.toLocaleLowerCase()}' limit 1`)
    return rows.pop();
}

const getUserByUserId = async (pool: any, user_id: string) => {
    const { rows } = await pool.query(`select * from users where user_id='${user_id}'`)
    return rows.pop();
}


const saveUser = async (pool: any, user: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.users
    (username, "password", privilege, email, active)
    VALUES('${user.username.toLocaleLowerCase()}', '${user.password}', ${user.privilege}, '${user.email.toLocaleLowerCase()}', '${user.active}')
    RETURNING user_id;`)
    return rows.pop();
}

const updateUser = async (pool: any, user: any) => {
    await pool.query(`
    UPDATE users
    SET username='${user.username.toLocaleLowerCase()}', privilege='${user.privilege}', email='${user.email.toLocaleLowerCase()}', active='${user.active}'
    WHERE user_id = ${user.user_id}`)
}

const updateUserPassword = async (pool: any, user: any) => {
    await pool.query(`
    UPDATE users
    SET password='${user.password}'
    WHERE user_id = ${user.user_id}`)
}
    

export { getUserByNameOrEmail, saveUser, updateUser, getUserByUserId, updateUserPassword }