import express from 'express';
const productRouter = express.Router();
import { standardErrorTreatment } from '../../helpers/errorTreatment'
import { getAllProducts, saveProduct, saveProductInstance, getProductWithInstances } from './../../fetch';

productRouter.post('*', async (req: any, res: any, next: any) => {
    const connect = await req.pool.connect();
    try{
        const { title, value, instances } = req.body;
        if (!title || !value) {
            res.sendStatus(404);
            return;
        }
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

productRouter.put('*', async (req: any, res: any, next: any) => {
    const connect = await req.pool.connect();
    try{

    } catch(err) {
        connect.query('ROLLBACK');
        standardErrorTreatment(res, err);
    }
    /*
    const { product_id, title, value, instances } = req.body;
    if (!product_id || !title || !value && !instances.all(ins => ins.instance_id)) {
        res.sendStatus(404);
        return;
    }


    connect.query('BEGIN');
    const { product_id } = await saveProduct(connect, { title, value });
    const ids = await Promise.all(instances.map(instance => saveProductInstance(connect, product_id, instance)));        
    connect.query('COMMIT');
    res.send({ product_id, ids })
    */
});

productRouter.get(['/list','/list/:id'], async (req: any, res: any, next: any) => {    
    try{
        const { id } = req.params;
        if (!id)
            res.send(await getAllProducts(req.pool))
        else 
            res.send(await getProductWithInstances(req.pool, id))    
    } catch (err) {
        standardErrorTreatment(res, err);
    }
})

export { productRouter }