import urlcat from 'urlcat';

export const baseFetch = async (url: string, body: any, type='GET') => {
    let requestOptions = {};
    
    switch(type.toLocaleLowerCase()){
        case 'post': 
            requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            };
        break;
        case 'put': 
            requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            };
        break;
        case 'get': 
            requestOptions = {
                method: 'get',
                headers: { 'Content-Type': 'application/json' },
            };
            url = urlcat(url, body)            
        break;
    }
    
    return await fetch(url, requestOptions);
}