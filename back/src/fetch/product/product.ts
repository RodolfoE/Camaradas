const getAllProducts = async (pool: any) => {
    const { rows } = await pool.query(`select p.*, i.instance_id, i.image_paths from public.product p left join public.instance i on p.product_id = i.product_id`)
    return rows;
}

const getProductWithInstances = async (pool: any, product_id: string) => {
    const { rows } = await pool.query(`select * from public.product p left join public.instance i on p.product_id = i.product_id where p.product_id=${product_id}`)
    return rows;
}

const saveProduct = async (pool: any, product: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.product
    (title, value)
    VALUES('${product.title}', ${product.value})
    RETURNING product_id;`)
    return rows.pop();
}

const saveProductInstance = async (pool: any, product_id: string, productInstance: any) => {
    const { rows } = await pool.query(`
    INSERT INTO public.instance
    (product_id, specification, quantity, image_paths)
    VALUES('${product_id}', '${productInstance.specification ? JSON.stringify(productInstance.specification) : ''}', ${productInstance.quantity}, '${productInstance.image_paths.join(',')}')
    RETURNING instance_id;`)
    return rows.pop().instance_id;
}

export { getAllProducts, getProductWithInstances, saveProduct, saveProductInstance }