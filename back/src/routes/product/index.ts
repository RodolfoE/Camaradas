import express from 'express';
const productRouter = express.Router();
import { standardErrorTreatment } from '../../helpers/errorTreatment'
import { getAllProducts, saveProduct, saveProductInstance, updateProduct, getProduct, updateProductInstance, getInstanceById, deleteProductInstance, deleteProduct } from './../../fetch';
import { FILE_PATHS } from './../../helpers/consts';
import multer from 'multer';
import fs from 'fs';
import { concat } from 'urlconcat';
import path from 'path';
const storage = multer.diskStorage({
    destination: FILE_PATHS
})
const upload = multer({ storage: storage })

/*
productRouter.post('/', async (req: any, res: any, next: any) => {
    const connect = await req.pool.connect();
    try{
        const { title, value, instances } = req.body;
        if (!title || !value) 
            throw { customError: true, statusCode: 404}
        connect.query('BEGIN');
        const { product_id } = await saveProduct(connect, { title, value });
        const ids = await Promise.all(instances.map(instance => saveProductInstance(connect, product_id, instance)));        
        connect.query('COMMIT');
        res.send({ product_id, ids })
    } catch (err) {
        connect.query('ROLLBACK');
        standardErrorTreatment(res, err);
    }
});
*/

productRouter.put(['/','/:product_id'], async (req: any, res: any, next: any) => {
    const connect = await req.pool.connect();
    try{
        const { title, value, instances } = req.body;
        if (!title || !value && !instances.all(ins => ins.instance_id)) 
            throw { customError: true, statusCode: 404}
    
        connect.query('BEGIN');
        if (!req.params.product_id)
            var { product_id } = await saveProduct(connect, { title, value });
        else {
            var product_id = req.params.product_id;
            await updateProduct(connect, { title, value }, Number(product_id))
            await deleteProductInstance(connect, { product_id: Number(req.params.product_id) })
        }
        instances && instances.map(async (instance) => await saveProductInstance(connect, { product_id, ...instance }))
        connect.query('COMMIT');
        res.send({ product_id })
    } catch(err) {
        connect.query('ROLLBACK');
        standardErrorTreatment(res, err);
    }
});

productRouter.delete('/:product_id/:instance_id', async (req: any, res: any, next: any) => {
    try{
        const { product_id, instance_id } = req.params;
        await deleteProductInstance(req.pool, { product_id, instance_id });
        fs.rm(concat(FILE_PATHS, `prod_${product_id}_${instance_id}*.jpg`), () => {})
        res.send(200)
    } catch (err) {
        standardErrorTreatment(res, err);
    }
})

productRouter.delete('/:product_id', async (req: any, res: any, next: any) => {
    try{
        const { product_id } = req.params;
        await deleteProduct(req.pool, { product_id });
        fs.rm(concat(FILE_PATHS, `prod_${product_id}_*.jpg`), () => {})
        res.send(200)
    } catch (err) {
        standardErrorTreatment(res, err);
    }
})

productRouter.put('/upload/:product_id/:instance_id', upload.single('product_photo'), async (req: any, res: any, next: any) => {
    const connect = await req.pool.connect();
    const { product_id, instance_id } = req.params;
    try{
        const file = req.file
        if (!file || !product_id) 
            throw { customError: true, statusCode: 404}
        const { image_paths } = await getInstanceById(req.pool, product_id, instance_id);
        const arrayImagePaths = !image_paths ? [] : image_paths.split(',')
        const extension = file.originalname.split('.')[file.originalname.split('.').length - 1];
        arrayImagePaths.push(`prod_${product_id}_${instance_id}_${arrayImagePaths.length}.${extension}`);
        fs.rename(req.file.path, concat(FILE_PATHS, arrayImagePaths[arrayImagePaths.length -1]) , () => {});
        await updateProductInstance(connect, { product_id, instance_id } ,{ image_paths: arrayImagePaths.join(',') });
        res.send(file)
    } catch(err) {
        connect.query('ROLLBACK');
        standardErrorTreatment(res, err);
    }
});

productRouter.get(['/list','/list/:id'], async (req: any, res: any, next: any) => {    
    try{
        const { id } = req.params;
        if (!id)
            res.send(await getAllProducts(req.pool))
        else 
            res.send(await getProduct(req.pool, id))    
    } catch (err) {
        standardErrorTreatment(res, err);
    }
})

export { productRouter }