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

/* app.get(`/:username`, async function (req, res) {
  const url =
      'https://localhost:3001/';
  const options = {
      method: 'GET',
      headers: {
        "Content-Type" : "application/json"
      }
  };

  // promise syntax
 fetch(url, options)
 .then(res => res.json())
 .then(body=>username = body.username)
 .then(()=>console.log(username))

 .catch(err => console.error('error:' + err));  

  try {
      let response =  await fetch(url, options);
      response = await response.json();
      res.status(200).json(response);
  } catch (err) {
      console.log(err);
      res.status(500).json({msg: `Internal Server Error.`});
  } 
}); */

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
     io.in(user.room).emit("message", formatMessage(user.username, msg));
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