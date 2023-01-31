import { privileges } from '../../helpers/consts'
import jwt from "jsonwebtoken";

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

export { hasPermission, isAuthenticated }