import { createServer } from "http";
import  express  from "express";
import { Server } from "socket.io";
import fetch from "node-fetch";


const app = express()
const httpServer= createServer(app);
/* server port */
const port = 3001;
/* client port */

 const io = new Server(httpServer, {
    cors: {
      origin: "*"
    },
}); 


app.use("/", express.static("./client"))

//fetch external api
const url = "https://pixabay.com/api/?key=27810659-a3dc498df919a5ca1eb2a21d3&image_type=photo&id=73424"

let imageURL
fetch(url)
.then(res => res.json())
.then(body=> imageURL = body.hits[0].userImageURL)
.then(()=>console.log(imageURL)) 
.catch(err => console.error('error:' + err)); 


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
      console.log(user.username, msg);
     //socket.broadcast.emit("message", msg);
     if(msg==="/gif"){
     io.in(user.room).emit("command", {user:user.username, url:imageURL})
     }else{
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

httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
})