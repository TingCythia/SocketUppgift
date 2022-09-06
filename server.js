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

io.on("connection", (socket) => {
    console.log("Connected!" + socket.id)


    //receive from client
    socket.on('chatMessages', (msg) =>{
      console.log(msg);
           // Welcome current user
     socket.broadcast.emit("message", msg);
    
    })

    // Disconnection
    socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
})