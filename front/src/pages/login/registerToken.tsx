import React, { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const RegisterToken = () => {
    const [token, setToken] = useState(useParams().token);
    let navigate = useNavigate();

    useEffect(() => {
        if (token)
            fetch(`/authentication/validatetoken/${token}`).then(() => {
                navigate('/');
            });
    }, []);

    return <div>Validando token...</div>
}

export { RegisterToken };