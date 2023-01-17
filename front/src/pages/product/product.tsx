import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch } from "../../fetch/baseFetch";
const Product = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user }: any) => {
    useEffect(() => {
        (async () => {
           // const response = await baseFetch('/product',{ title: 'aslkdjf', value: 50, instances: [{ specification: { color: 'blue' }, quantity: 5, image_paths: []}, { specification: { color: 'blue' }, quantity: 5, image_paths: []}] }, 'POST')
            //const response = await baseFetch('/product ', {});
        })();        
    }, []);

    return <div>Eu sou produto</div>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user } }: any) => ({ isAuthenticated, isFetching, user })
export default connect(mapStateToProps)(Product)