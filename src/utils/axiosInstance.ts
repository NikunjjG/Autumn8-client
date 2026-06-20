import axios from "axios";
import { store } from "../store/store";
import { logout } from "../store/slices/authSlice";

const BACKEND_HOST_URI = import.meta.env.VITE_BACKEND_HOST_URI

export const axiosInstance = axios.create({
    baseURL: BACKEND_HOST_URI,
    timeout: 30000,
    headers: {
        "Content-Type": 'application/json'
    }
})

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(logout())
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)