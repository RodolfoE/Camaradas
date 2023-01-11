import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
// Define a type for the slice state
interface UserState {
  username: string
}

// Define the initial state using that type
const initialState: UserState = {
  username: 'asdfasdfasdf'
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginReducer: (state, action: PayloadAction<UserState>) => {
      state = action.payload;
    }
  },
})

export const { loginReducer } = authSlice.actions

export const selectCount = (state: RootState) => state.authSlice.username

export default authSlice.reducer