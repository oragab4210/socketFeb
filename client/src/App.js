import "./App.css";
import socketIOClient from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";

// const SOCKET_SERVER_URL = `http://${process.env.REACT_APP_CLIENT_URL}:4000`;
const SOCKET_SERVER_URL = `http://localhost:4000`;

function App() {
  const socketRef = useRef();
  const [online, setOnline] = useState(0);
  // socketRef.current = socketIOClient(SOCKET_SERVER_URL);

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      rejectUnauthorized: false,
    });
    console.log("working", socketRef.current);
    // socketRef.current = socketIOClient(SOCKET_SERVER_URL);
    socketRef.current.emit("login", { userId: 5 });
    socketRef.current.on("onlineUsers", (data) => {
      const onlineUsers = Object.entries(data);
      const onlineIds = Array.from(onlineUsers, (x) => x[1]);
      setOnline(onlineIds.length);
      console.log(onlineIds);
    });
  }, []);

  /* -------------------------------------------------------------------------- */
  return (
    <div ref={socketRef} className="App">
      {online}
    </div>
  );
}

export default App;
