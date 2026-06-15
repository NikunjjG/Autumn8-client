import axios from "axios";

const BACKEND_HOST_URI = import.meta.env.VITE_BACKEND_HOST_URI

export const axiosInstance = axios.create({
    baseURL: BACKEND_HOST_URI,
    timeout: 30000,
    headers: {
        "Content-Type": 'application/json'
    }
})