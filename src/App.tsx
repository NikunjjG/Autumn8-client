import { useEffect, useRef, useState } from 'react'
import './App.css'
import { establishSocketConnection } from './socket/socket.functions'
import type { Socket } from 'socket.io-client'
import { WEB_SOCKET_ACTIONS } from './socket/ws_actions'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';

interface ISessionToken {
  sessionId: string;
  sessionToken: string;
}

interface ICoordinates {
  x: number,
  y: number
}

interface ICursorMap {
  [key: string]: ICoordinates
}


function SocketPlaceHolder() {
  const { token } = useParams()

  const [USER] = useState(() => ({
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    userName: "Nikunj"
  }))

  const socketRef = useRef<null | Socket>(null)
  const [sessionToken, setSessionToken] = useState<ISessionToken | null>(null)
  const [remoteCursors, setRemoteCursors] = useState<ICursorMap>({});

  console.log('Log in API triggered.')

  const enableCollaboration = () => {
    if (socketRef.current) return;

    socketRef.current = establishSocketConnection()

    socketRef.current.on(WEB_SOCKET_ACTIONS.CONNECT, () => {
      if (token) {
        socketRef.current.emit(WEB_SOCKET_ACTIONS.JOIN_SESSION, token)
      } else {
        socketRef.current.emit(WEB_SOCKET_ACTIONS.CREATE_SESSION, USER.userId)
      }
    })

    socketRef.current.on(WEB_SOCKET_ACTIONS.SESSION_CREATED, (data) => {
    setSessionToken(data)
    });

    socketRef.current.on(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT_LISTENER, (data: { userId: string; coordinates: ICoordinates }) => {
      console.log('mouse movement of client')
    setRemoteCursors((prevCursors) => ({
      ...prevCursors,
      [data.userId]: data.coordinates
    }));
  });
  }

  useEffect(() => {
    if(token){
      enableCollaboration()
    }
  }, [token])

  console.log(remoteCursors)

  useEffect(() => {
  const handleMouseMove = (event: MouseEvent) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, {
        userId: USER.userId,
        coordinates: { x: event.clientX, y: event.clientY }
      });
    }
  };
    window.addEventListener('mousemove', handleMouseMove);
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, [token]);

  useEffect(() => {
    const socket = socketRef.current;
    console.log(socket)
    if (!socket) return;

    socket.on(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT, (data: { userId: string; coordinates: ICoordinates }) => {
      console.log(data)
      setRemoteCursors((prevCursors) => ({
        ...prevCursors,
        [data.userId]: data.coordinates
      }));
    });


    return () => {
      socket.off(WEB_SOCKET_ACTIONS.CURSOR_MOVEMENT);
    };
  }, [USER.userId]);

  // console.log(remoteCursors)


  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-5xl font-bold text-emerald-400">
        Tailwind is working!
      </h1>
      {!token && (
        <button onClick = {enableCollaboration} className='bg-red-500'>Collaborate!</button>
      )}

      <div>
        {sessionToken?.sessionToken && (
          <>
            <p className='text-white'>Share this URL for a shared session.</p>
            <p className='text-white'>{`${window.location.href}${sessionToken?.sessionToken}`}</p>
          </>
        )}
      </div>

      {Object.entries(remoteCursors).map(([userId, coords]) => (
        <div
          key={userId}
          className="pointer-events-none absolute transition-all duration-75 ease-out"
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 9999,
          }}
        >
          <svg
            className="w-5 h-5 fill-emerald-400 stroke-slate-900 stroke-2 drop-shadow-md"
            viewBox="0 0 24 24"
          >
            <path d="M4.5 3V18l4.28-4.28 4.72 9.56 3.14-1.56-4.72-9.56H19.5z" />
          </svg>
          
          <span className="ml-3 bg-emerald-500 text-slate-950 font-bold text-xs px-1.5 py-0.5 rounded shadow">
            {userId === USER.userId ? "You" : `User ${userId}`}
          </span>
        </div>
      ))}

    </div>
  )
}

// export default App

// Import your page components
// 1. Create the router configuration array
const router = createBrowserRouter([
  {
    path: "/",
    // element: <Home />,
    element: <SocketPlaceHolder/>
  },
  {
    path: "/:token",
    element: <SocketPlaceHolder/>
  },
  {
    path: "/dashboard",
    // element: <Dashboard />,
  },
  {
    path: "*", // Catch-all for any undefined URLs (404)
    // element: <NotFound />,
  }
]);

// 2. Provide the router to your app
export default function App() {
  return <RouterProvider router={router} />;
}