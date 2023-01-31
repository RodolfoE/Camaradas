import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch, baseFetchInJson } from "../../../fetch/baseFetch";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
//const response = await baseFetch('/product/upload',{ product_id: 1, data }, 'POST')
//const response = await baseFetch('/product/2',{ title: 'aslkdjf', value: 50, instances: [{ instance_id: 22, specification: { color: 'red' }, quantity: 5, image_paths: []}, { instance_id: 23,specification: { color: 'blue' }, quantity: 5, image_paths: []}] }, 'PUT')
//const response = await baseFetch('/product ', {});
const Product = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user, fetchFinished }: any) => {
    const navigate = useNavigate()
    const [pictures, setPictures] = useState([]) as any;
    const [instances, setInstances] = useState([]) as any;
    const [product, setProduct] = useState() as any;

    const uploadPicture = (instance_id: number) => async (e: any) => {
        e.preventDefault();
        var data = new FormData()
        data.append("product_photo", e.target.files[0]);
        try{
            await fetch(`/product/upload/${product.product_id}/${instance_id}`, {
                method: "put",
                body: data,
            });
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
        await baseFetch(`/product/${product.product_id}`, { ...product, instances: update ? product.instances : [...product.instances, { quantity: 0, image_paths:  '', specification: {color: 'blue'}}] }, 'PUT')
        refreshProduct();
    }

    const sendRequest = (instance_id: number) => async (e: any) => {
        e.preventDefault();
        var data = new FormData()
        data.append("product_photo", pictures.find((pic: { instance_id: number; }) => pic.instance_id === instance_id).pictureAsFile);
        try{
            await fetch(`/product/upload/${product.product_id}/${instance_id}`, {
                method: "put",
                body: data,
            });
        } catch (err) {
            console.log(err);
        }
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
        Título:
        <input onChange={(vlr) => setProduct({...product, title: vlr.target.value })} type={'text'} value={product.title}/><br/> 
        Valor:
        <input onChange={(vlr) => setProduct({...product, value: vlr.target.value })}type={'text'} value={product.value}/><br/>

        <button onClick={() => putInstance()}>Adicionar Produto</button>
        <button onClick={() => putInstance(true)}>Atualizar</button>
        <table>
            <tbody>
        {
            product.instances.map((instance:any) => {
                return <tr>
                    <td>{instance.instance_id}</td>
                    <td><input type={'text'} onChange={(vlr) => onChange('quantity', vlr.target.value, instance.instance_id)} value={instance.quantity} placeholder={'quantity'}/></td>
                    <td><input type={'text'} onChange={(vlr) => onChange('image_paths', vlr.target.value, instance.instance_id)} value={instance.image_paths} placeholder={'image_paths'}/></td>
                    Foto: <input type="file" name="image" onChange={uploadPicture(instance.instance_id)}/>
                </tr>
            })
        }
            </tbody>
        </table>
        
    </div>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user, fetchFinished } }: any) => ({ isAuthenticated, isFetching, user, fetchFinished })
export default connect(mapStateToProps)(Product)