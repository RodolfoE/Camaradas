export const baseFetch = async (url: string, body: any, type: string) => {
    let requestOptions = {};
    
    switch(type.toLocaleLowerCase()){
        case 'post': 
            requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            };
        break;
    }
    
    return await fetch(url, requestOptions);
}