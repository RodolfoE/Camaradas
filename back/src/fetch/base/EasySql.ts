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

const isNullOrUndefined = (prop: any) => prop == null || prop == undefined || prop == 'null' || prop == 'undefined' || (typeof prop === 'string' && prop.length == 0);

const getValueOrDefault = (prop: any, typeDefault: any) => {
    if (!isNullOrUndefined(prop))
        return prop;
    switch(typeDefault){
        case 'string': return ''
        case 'number': return 0
    }
    return typeDefault
}

const baseInsert = async (pool: any, tableName: string, body: any, primaryKey='') => {
    const keys = Object.keys(body);
    const names = [];
    const values = [];
    for (let i = 0; i < keys.length; i++) {
        switch (typeof body[keys[i]]) {
            case 'string':
                if (!isNullOrUndefined(body[keys[i]])){
                    names.push(`${keys[i]}`);   
                    values.push(`'${body[keys[i]]}'`);
                }                
            break;
            case 'number':
                names.push(`${keys[i]}`);   
                values.push(`${body[keys[i]]}`);
            break;
            case 'object':
                if (!isNullOrUndefined(body[keys[i]])){
                    names.push(`${keys[i]}`);   
                    values.push(`'${JSON.stringify(body[keys[i]])}'`);
                }                    
            break;
        }        
    }
    const { rows } = await pool.query(`
        INSERT INTO ${tableName} (${names.join(',')}) VALUES (${values.join(',')})
        ${primaryKey ? `RETURNING ${primaryKey};` : ';'}`);
    return rows.pop();
}

const baseUpdate = (pool: any, tableName: string, body: any, primaryKey: any) => {
    const [itemsInSet, itemInPrimaryKey] = [transForm(body), transForm(primaryKey)];
    ;
    if (!itemsInSet || !itemsInSet.length)
        throw { customError: true, statusCode: 404}

    return pool.query(`
    UPDATE ${tableName}
    SET ${itemsInSet.join(',')}
    WHERE ${itemInPrimaryKey.join(' AND ')};`);
}

const baseSelect = (pool: any, tableName: string, where: any) => {
    return pool.query(`
    SELECT * FROM ${tableName}
    WHERE ${transForm(where).join(' AND ')};`);
}

const baseDelete = (pool: any, tableName: string, where: any) => {
    return pool.query(`
    DELETE FROM ${tableName}
    WHERE ${transForm(where).join(' AND ')};`);
}

export { baseUpdate, baseSelect, baseDelete, baseInsert }