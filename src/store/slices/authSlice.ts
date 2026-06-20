import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  credits: number | null
}

const initialState: AuthState = {
  token: localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('authUser') ?? 'null'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  credits: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      localStorage.setItem('authToken', action.payload.token)
      localStorage.setItem('authUser', JSON.stringify(action.payload.user))
    },
    setCredits: (state, action: PayloadAction<number>) => {
      state.credits = action.payload
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.credits = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
    },
  },
})

export const { setCredentials, setCredits, logout } = authSlice.actions

export default authSlice.reducer
