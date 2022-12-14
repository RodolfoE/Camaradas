import { Pool, types } from 'pg'

export const getDbPool = async () => {
    return new Pool({
        //connectionString: process.env.POSTGRES_URI,
        database: 'postgres'
    })
}