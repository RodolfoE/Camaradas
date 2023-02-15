import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch, baseFetchInJson } from "../../../fetch/baseFetch";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AddIcon from '@mui/icons-material/Add';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';


const Product = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user, fetchFinished }: any) => {
    const navigate = useNavigate()
    const [product, setProduct] = useState([]) as any;
    const [isExpended, setIsExpended] = useState({}) as any;
    const [quantityOfProdct, setQuantityOfProdct] = useState(-1) as any;
    

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
        if (!isNaN(Number(id))){
            const products = await baseFetchInJson(`/product/list/${id}`, {}, 'GET');
            console.log(products.instances)
            const expended = {} as any;
            for (let i = 0; i < products.instances.length; i++) expended[products.instances[i].instance_id] = i === 0;
            setProduct(products)
            setIsExpended(expended);
            console.log(expended)
            setQuantityOfProdct(products.instances.length)
        }
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
    return <div>
        <Card sx={{ minWidth: 275, marginBottom: '10px' }}>
            <Box>
                <CardContent>
                    <Typography sx={{ fontSize: 14, marginBottom: 2 }} color="text.secondary" gutterBottom>
                        Produto
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <TextField  sx={{ marginRight: '6px' }} placeholder='Título' variant="outlined" onChange={(vlr) => setProduct({...product, title: vlr.target.value })} value={product.title}/>          
                        <TextField placeholder="Valor" variant="outlined" onChange={(vlr) => setProduct({...product, value: vlr.target.value.replace('R$ ', '') })} value={product.value && ('R$ ' + product.value).replace(',', '.') }/>
                    </Box>
                    <Box sx={{marginTop: 1}}>
                        {
                            product.product_id && <Button variant="contained" sx={{width: '100%'}}  onClick={() => putInstance(true)}><RefreshIcon/></Button>
                        }                        
                    </Box>
                </CardContent>
            </Box>            
        </Card>

        <Card sx={{ width: '100%', float: 'right' }}>
            {
                quantityOfProdct !== -1 && <Box sx={{margin: '15px'}}>
                <Chip label={'Total: ' + quantityOfProdct} />
            </Box>
            }
            
            {
                product.instances && product.instances.map(function (instance:any, index: number) {
                    return <Box sx={{margin: '15px'}}>
                        <Accordion expanded={isExpended[product.instances[index].instance_id]}>
                                <AccordionSummary
                                        expandIcon={<ExpandMoreIcon onClick={function () {
                                            isExpended[product.instances[index].instance_id] = !isExpended[product.instances[index].instance_id]
                                            setIsExpended(isExpended);
                                        }}/>}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header">
                                    
                                    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                                        <Chip label={instance.instance_id} />
                                        
                                        <Button variant="text" component="label">
                                            <AddAPhotoIcon/><input type="file" onChange={uploadPicture(instance.instance_id)} hidden />
                                        </Button>
                                        
                                    </Stack>
                                </AccordionSummary>

                                <AccordionDetails sx={{margin: '15px'}}>                                    
                                    <Typography>
                                    <Box>
                                        <Slider
                                            defaultValue={instance.quantity}
                                            min={0}
                                            max={1100}
                                            onChange={(vlr: any) => { onChange('quantity', vlr.target.value, instance.instance_id)}}
                                            valueLabelDisplay="on"/>
                                        </Box>                                
                                    </Typography>
                                {
                                    instance.image_paths && 
                                    <ImageList sx={{ width: '100%', height: '100%' }} cols={2} rowHeight={164}>
                                        {instance.image_paths.split(',').map((path: string, idx: Number) => (
                                            <ImageListItem key={idx + ''}>
                                            <img
                                                src={`/static/images/${path}`}
                                                loading="lazy"
                                                height={10}
                                                width={10}
                                            />
                                            </ImageListItem>
                                        ))}
                                    </ImageList>
                                }
                                </AccordionDetails>
                        
                        </Accordion>
                    </Box>
                })
            }
            <Box sx={{margin: 2}}>
                <Button sx={{width: '100%'}} variant="contained" onClick={() => putInstance()}><AddIcon/></Button>
            </Box>
        </Card>
    </div>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user, fetchFinished } }: any) => ({ isAuthenticated, isFetching, user, fetchFinished })
export default connect(mapStateToProps)(Product)

/**
 *                         Foto: <input type="file" onChange={uploadPicture(instance.instance_id)}/>
                        <button onClick={() => deleteInstance(instance.instance_id)}>Deletar</button>
 */