const getUserByNameOrEmail = async (pool: any, user: string, email: string) => {
    const { rows } = await pool.query(`select * from users where username='${user}' or email='${email}' limit 1`)
    return rows.pop();
}

const saveUser = async (pool: any, user: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.users
    (username, "password", privilege, email)
    VALUES('${user.username}', '${user.password}', '${user.privilege}', '${user.email}')
    RETURNING user_id;`)
    return rows.pop();
}
    

export { getUserByNameOrEmail, saveUser }