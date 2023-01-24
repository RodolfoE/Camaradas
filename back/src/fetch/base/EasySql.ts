const transForm = (item: any) => {
    const obj = Object.keys(item).map(key => {
        switch(typeof item[key]) {
            case 'string': 
                 return `${key}='${item[key]}'`
            case 'number': 
                return `${key}=${item[key]}`
        }
    });
    return obj.filter(ob => ob) || [];
}


const baseUpdate = (pool: any, tableName: string, body: any, primaryKey: any) => {
    const itemsInSet = transForm(body);
    const itemInPrimaryKey = transForm(primaryKey);
    if (!itemsInSet || !itemsInSet.length)
        throw { customError: true, statusCode: 404}

    return pool.query(`
    UPDATE ${tableName}
    SET ${itemsInSet.join(',')}
    WHERE ${itemInPrimaryKey.join(' AND ')};`);
}

export { baseUpdate }