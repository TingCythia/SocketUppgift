import { createServer } from "http";
import  express  from "express";
import { Server } from "socket.io";



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

io.on("connection", (socket) => {
    console.log(socket.id)
    socket.on("connect", ()=>{
        console.log()
    })
})

httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
})