import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch, baseFetchInJson } from "../../../fetch/baseFetch";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


const Product = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user, fetchFinished }: any) => {
    const navigate = useNavigate()
    const [product, setProduct] = useState([]) as any;
    const uploadPicture = (instance_id: number) => async (e: any) => {
        e.preventDefault();
        var data = new FormData()
        data.append("product_photo", e.target.files[0]);
        try{
            await fetch(`/product/upload/${product.product_id}/${instance_id}`, {
                method: "put",
                body: data,
            });
            
            e.target.value = ''
            refreshProduct();
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (fetchFinished && Number(user?.privilege) !== 1)
            navigate('/');

        (async () => {
            refreshProduct();
        })();        
    }, []);

    const refreshProduct = async () => {
        const id = window.location.href.split('/')[window.location.href.split('/').length -1];
        if (!isNaN(Number(id)))
            setProduct(await baseFetchInJson(`/product/list/${id}`, {}, 'GET'))
    }

    const putInstance = async (update=false) => {
        if (!product.product_id){
            const { product_id } = await baseFetchInJson('/product', product , 'PUT')
            navigate('/crud/product/' + product_id);
        }    
        else {
            if (update)
                await baseFetch(`/product/${product.product_id}`, product , 'PUT')
            else {
                if (product.instances && product.instances.length)
                    await baseFetch(`/product/${product.product_id}`, { ...product, instances: [...product.instances, { instance_order: product.instances.length, quantity: 0, image_paths:  '', specification: {color: 'blue'}}]} , 'PUT') 
                else
                    await baseFetch(`/product/${product.product_id}`, { ...product, instances: [{ instance_order: 0, quantity: 0, image_paths:  '', specification: {color: 'blue'}}]} , 'PUT') 
             }     
        }           
        refreshProduct();
    }

    const deleteInstance = async (instance_id: string) => {
        await baseFetch(`/product/${product.product_id}/${instance_id}`, product , 'DELETE')
        refreshProduct();
    }

    const onChange = (attName: string, attValue: any, instance_id=false) => {
        if (instance_id)
            setProduct({ ...product, instances: [...product.instances, {[attName]: attValue}] })

        setProduct({ ...product, instances: product.instances.map(((ins: any) => {
            if (ins.instance_id === instance_id)
                ins[attName] = attValue
            return ins;
        }))})
    }

    return product && <div>
        <Card sx={{ minWidth: 275 }}>
            <Box>
            <CardContent>
                <Typography sx={{ fontSize: 14, marginBottom: 2 }} color="text.secondary" gutterBottom>
                    Produto
                </Typography>
                <TextField label="Título" variant="outlined" onChange={(vlr) => setProduct({...product, title: vlr.target.value })} value={product.title}/>          
                <TextField label="Valor" variant="outlined" onChange={(vlr) => setProduct({...product, value: vlr.target.value })} value={product.value && (product.value + '').replace(',', '.') }/>
                </CardContent>
            </Box>
        </Card>        

        <button onClick={() => putInstance()}>Adicionar Produto</button>
        <button onClick={() => putInstance(true)}>Atualizar</button>
        <table>
            <tbody>
        {
            product.instances && product.instances.map((instance:any) => {
                return <tr>
                    <td>{instance.instance_id}</td>
                    <td><input type={'text'} onChange={(vlr) => onChange('quantity', vlr.target.value, instance.instance_id)} value={instance.quantity} placeholder={'quantity'}/></td>
                    <td>
                        {
                            instance.image_paths && instance.image_paths.split(',').map((path: string) => <img height={50} width={50} src={`/static/images/${path}`} />)
                        }
                        <input type={'text'} onChange={(vlr) => onChange('image_paths', vlr.target.value, instance.instance_id)} value={instance.image_paths} placeholder={'image_paths'}/>
                    </td>
                    Foto: <input type="file" onChange={uploadPicture(instance.instance_id)}/>
                    <button onClick={() => deleteInstance(instance.instance_id)}>Deletar</button>
                </tr>
            })
        }
            </tbody>
        </table>
        
    </div>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user, fetchFinished } }: any) => ({ isAuthenticated, isFetching, user, fetchFinished })
export default connect(mapStateToProps)(Product)