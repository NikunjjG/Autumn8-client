import { io, Socket } from "socket.io-client";

const BACKEND_HOST_URI = import.meta.env.VITE_BACKEND_HOST_URI

export const establishSocketConnection = (): Socket => {
    return io(BACKEND_HOST_URI, {
        forceNew: true,
        multiplex: false,
        transports: ['websocket']
    })
}