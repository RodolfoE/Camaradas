import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Loading = ({isLoading, withNavDraw=true, children} : any) => {
    return <>
    {
        isLoading ?
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: `calc(100vh - ${withNavDraw ? 206 : 56 }px)`,
            minWidth: `${withNavDraw ? 73 : 100}vw`
          }} >
            <CircularProgress color='info'/>
        </Box>
        :
        children
    }    
    </>
}

export { Loading };