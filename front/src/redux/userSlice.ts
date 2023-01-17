import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
// Define a type for the slice state
interface UserState {
  isAuthenticated?: boolean
  isFetching?: boolean
  user? : {
    username: string
    password: string
    email: string
    active: number
    stretegy: string
  }  
}

// Define the initial state using that type
const initialState: UserState = {
  isAuthenticated: false,
  isFetching: false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLogin: (state) => {
      state.isFetching = true;
    },
    finishLogin: (state) => {
      state.isFetching = false;
    },
    setUser: (state: any, action: any) => {
      state.user = action.payload;
    }
  },
})

export const { startLogin, finishLogin, setUser } = authSlice.actions

export const selectCount = (state: RootState) => state.authSlice

export default authSlice.reducer