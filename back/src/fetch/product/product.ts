import { baseUpdate } from '../base/EasySql';

const getAllProducts = async (pool: any) => {
    const { rows } = await pool.query(`select p.*, i.instance_id, i.image_paths from public.product p left join public.instance i on p.product_id = i.product_id`)
    return rows;
}

const getProduct = async (pool: any, product_id: string, WithInstances=true) => {    
    if (WithInstances)
        var query = `select * from public.product p left join public.instance i on p.product_id = i.product_id where p.product_id=${product_id}`
    else 
        var query = `select * from public.product where product_id=${product_id}`
    
    const { rows } = await pool.query(query)
    return rows.pop();
}

const saveProduct = async (pool: any, product: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.product
    (title, value)
    VALUES('${product.title}', ${product.value})
    RETURNING product_id;`)
    return rows.pop();
}

const updateProduct = (pool: any, product: any, product_id: number) => baseUpdate(pool, 'public.product', product, { product_id })

const saveProductInstance = async (pool: any, product_id: string, productInstance: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.instance
    (product_id, specification, quantity, image_paths)
    VALUES('${product_id}', '${productInstance.specification ? JSON.stringify(productInstance.specification) : ''}', ${productInstance.quantity}, '${productInstance.image_paths.join(',')}')
    RETURNING instance_id;`)
    return rows.pop().instance_id;
}

const updateProductInstance = (pool: any, primaryKey: any, productInstance: any) => baseUpdate(pool, 'public.instance', productInstance, primaryKey)

export { getAllProducts, getProduct, saveProduct, saveProductInstance, updateProduct, updateProductInstance }