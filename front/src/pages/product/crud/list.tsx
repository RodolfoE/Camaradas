import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch, baseFetchInJson } from "../../../fetch/baseFetch";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const List = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user, fetchFinished }: any) => {
    const [products, setProducts] = useState([]) as any;
    const navigate = useNavigate()


    useEffect(() => {
        if (fetchFinished && Number(user?.privilege) !== 1)
            navigate('/');

        refreshProducts();
    }, []);


    const refreshProducts = async () => {
        setProducts(await baseFetchInJson(`/product/list`, {}, 'GET'))
    }

    const deleteInstance = async (product_id: string) => {
        await baseFetch(`/product/${product_id}`, null, 'DELETE')
        refreshProducts();
    }

    return <table>
        <thead>
            <th>Id</th>
            <th>Titulo</th>
            <th>Valor</th>
            <th>Atualizar</th>
            <th>Deletar</th>
        </thead>
        <tbody>
            {
                products && products.map(({product_id, title, value}: any) => {
                
                    return <tr>
                            <td>{product_id}</td>
                            <td>{title}</td>
                            <td>{value}</td>
                            <td><button onClick={() => navigate('/crud/product/' + product_id)}>Update</button></td>
                            <td><button onClick={() => deleteInstance(product_id)}>Delete</button></td>
                        </tr>
                })
            }
            
        </tbody>
    </table>
}
const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user, fetchFinished } }: any) => ({ isAuthenticated, isFetching, user, fetchFinished })
export default connect(mapStateToProps)(List)