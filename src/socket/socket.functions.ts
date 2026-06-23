import { io, Socket } from "socket.io-client";

const BACKEND_HOST_URI = import.meta.env.VITE_BACKEND_HOST_URI

interface SocketAuthParams {
    token: string
    collabToken?: string
    workflowId?: string
}

export const establishSocketConnection = (auth: SocketAuthParams): Socket => {
    return io(BACKEND_HOST_URI, {
        forceNew: true,
        multiplex: false,
        transports: ['websocket'],
        auth,
    })
}
