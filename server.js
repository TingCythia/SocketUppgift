import { createServer } from "http";
import  express  from "express";
import { Server } from "socket.io";

const app = express()
const httpServer= createServer(app);
const port = 3001;
const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
});

httpServer.listen(port, () => {
    console.log("Server is running on port " + port);
})