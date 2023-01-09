export const standardErrorTreatment = (response: any, err: any) => {
    if (err.customError)
        response.sendStatus(err.statusCode)
    else 
        response.sendStatus(500);
    console.error(err.messege)
}