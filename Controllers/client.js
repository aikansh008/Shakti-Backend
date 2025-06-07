const io = require("socket.io")(server);

const chatNamespace = io.of("/chat");

// Use your adapted middleware here
chatNamespace.use(socketJwtMiddleware);

chatNamespace.on("connection", (socket) => {
  console.log("User connected:", socket.user); // now you have user info

  // Your socket event handlers here
});
