const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

const app = express();
const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: `${process.env.CLIENT_URL}:4000` || 4000,
//     methods: ["GET", "POST"],
//   },
// });
const io = socketIO(server, {
  cors: true,
  origins: [process.env.CLIENT_URL],
});
/* ------------------------------- cors setup ------------------------------- */
// const corsOptions = {
//   // origin: `${process.env.CLIENT_URL}:4000`,
//   origin: `*`,
//   credentials: true,
// };
// app.use(cors(corsOptions));
app.use(cors("*"));
/* ----------------------------- GraphQL Options ---------------------------- */

/* -------------------------- Configure Production -------------------------- */
app.use(express.static("client/build"));
app.use(express.static(path.join(__dirname, "..", "client", "build")));
console.log(__dirname);
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

/* -------------------------------- Socket.IO ------------------------------- */
//
const onlineUsersObjects = {};
io.on("connection", (socket) => {
  console.log("connected");
  socket.on("login", (data) => {
    const onlineUsers = Object.entries(onlineUsersObjects);
    const onlineIds = Array.from(onlineUsers, (x) => x[1]);

    // if (onlineIds.includes(data.userId) === false && data.userId !== null) {
    onlineUsersObjects[socket.id] = data.userId;
    io.emit("onlineUsers", onlineUsersObjects);
    console.log(onlineUsersObjects);

    // } else {
    //   io.emit("onlineUsers", onlineUsersObjects);
    // }
  });

  socket.on("refetchOnlineUsers", (data) => {
    io.emit("onlineUsers", onlineUsersObjects);
  });

  socket.on("setRoom", (data) => {
    socket.join(data);
  });

  socket.on("newMessage", (data) => {
    io.in(data.room).emit("newMessage", data);
  });

  socket.on("logout", (data) => {
    console.log("logout socket", data.socketId);
    delete onlineUsersObjects[data.socketId];
    io.emit("onlineUsers", onlineUsersObjects);
  });

  // });

  socket.on("disconnect", (data) => {
    socket.leave(data);
    socket.disconnect();

    console.log("DISCONNECTING");
    delete onlineUsersObjects[socket.id];

    io.emit("onlineUsers", onlineUsersObjects);
    console.log(onlineUsersObjects);
  });
});

/* --------------------------- RUN SERVER ON PORT --------------------------- */
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("Listening on port: ", port);
});
