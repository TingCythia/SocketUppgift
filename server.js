import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import  express  from "express";
import { Server } from "socket.io";
import fetch from "node-fetch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.join(__dirname, "client", "dist");
const pixabayApiKey = process.env.PIXABAY_API_KEY;
const clientOrigin = process.env.CLIENT_ORIGIN || "*";

const app = express()
const httpServer= createServer(app);
/* server port */
const port = process.env.PORT || 3001;
/* client port */

 const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin
    },
});

if (fs.existsSync(clientDistPath)) {
  app.use("/", express.static(clientDistPath));
}

async function fetchPixabayImage(imageId, field) {
  if (!pixabayApiKey) return undefined;

  const url = `https://pixabay.com/api/?key=${pixabayApiKey}&image_type=photo&id=${imageId}`;

  try {
    const response = await fetch(url);
    const body = await response.json();
    return body.hits?.[0]?.[field];
  } catch (err) {
    console.error("Pixabay fetch error:", err);
    return undefined;
  }
}

let imageURL;
let imageURL2;

fetchPixabayImage("73424", "userImageURL").then((url) => {
  imageURL = url;
});

fetchPixabayImage("2639738", "previewURL").then((url) => {
  imageURL2 = url;
});


// create user
const users = [];
function userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

// format username and message
function formatMessage(username, text) {
  return {
    username,
    text,
  };
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const appName = "ChatApp";

io.on("connection", (socket) => {
    console.log("Connected!" + socket.id)

    // join room
    console.log(io.of("/").adapter);
    socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);  

    // Broadcast when a user connects
     io
    .to(user.room)
    .emit(
      "message",
      formatMessage(appName, `User ${user.username} has joined the chat`)
    );
    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  })
    //receive from client
    socket.on('chatMessages', (msg) =>{
   
      const user = getCurrentUser(socket.id);
      if (!user) return;

      console.log(user.username, msg);
     //socket.broadcast.emit("message", msg);

     if(msg==="/gif" && imageURL){
     io.in(user.room).emit("command", {user:user.username, url:imageURL})
     }     
     else if(msg==="/emoji" && imageURL2){
      io.in(user.room).emit("command", {user:user.username, url:imageURL2})
      }
     else if(msg === "/gif" || msg === "/emoji"){
     io.in(user.room).emit("message", formatMessage(appName, "Media commands are not configured for this demo."));
      }
     else{
     io.in(user.room).emit("message", formatMessage(user.username, msg));
    }
    })
    
    // Disconnection
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(appName, `${user.username} has left the chat`)
        );
  
        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
  });
})

if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
})
