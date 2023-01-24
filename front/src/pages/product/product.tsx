import React, { useState, useCallback, useEffect} from 'react'
import { connect } from 'react-redux'
import { baseFetch } from "../../fetch/baseFetch";
import axios from 'axios';

const Product = ({ tokenType, dispatch, isAuthenticated, isFetching, isLoading, user }: any) => {

    const [picture, setPicture] = useState({}) as any;

  const uploadPicture = (e: any) => {
    setPicture({
      /* contains the preview, if you want to show the picture to the user
           you can access it with this.state.currentPicture
       */
      picturePreview: URL.createObjectURL(e.target.files[0]),
      /* this contains the file we want to send */
      pictureAsFile: e.target.files[0],
    });
  };
    useEffect(() => {
        (async () => {
            const input = document.querySelector('input[type="file"]') as any

            var data = new FormData()
            data.append('zebra', input['files'][0])
            //const response = await baseFetch('/product/upload',{ product_id: 1, data }, 'POST')
            //const response = await baseFetch('/product/upload',{ title: 'aslkdjf', value: 50, instances: [{ specification: { color: 'blue' }, quantity: 5, image_paths: []}, { specification: { color: 'blue' }, quantity: 5, image_paths: []}] }, 'POST')
            //const response = await baseFetch('/product ', {});
        })();        
    }, []);

    const sendRequest = async (e: any) => {
        e.preventDefault();
        var data = new FormData()
        data.append("product_photo", picture.pictureAsFile);
        try{
            await fetch("/product/upload/2", {
                method: "put",
                //headers: { "Content-Type": "multipart/form-data" },
                body: data,
            });
        } catch (err) {
            console.log(err);
        }
        //const response = await baseFetch('/product/upload',{ product_id: 1, data }, 'POST')
        //console.log(response);
    }

    return  <div>
        <form onSubmit={sendRequest}>
        <label>Select file to upload</label> 
        <input type="file" name="image" onChange={uploadPicture}/>
        <br/>
        <button type='submit' >Convert</button>
        </form>
  </div>
}

const mapStateToProps = ( { authSlice: { isAuthenticated, isFetching, user } }: any) => ({ isAuthenticated, isFetching, user })
export default connect(mapStateToProps)(Product)