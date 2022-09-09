# SocketUppgift
 
For this school project´s goal is understanding how to use Socketio in a realtime chat application. 
This project was built by Nodejs, Express and Socketio with Vanila Javascript. 

First step is npm install all the dependencies : cors, express, http, node-fetch , nodemon, socket.io; In the package.json add "type":"module" as the whole files type.

After all setup, start to create 2 main files to contain server and client, in server.js setup the port is 3001, and the app will use express.static method to connect with client file. Later on add io connection between client and server. And also built standard structure with Socket.io.
Idea from socket.io website's documentation. 

Hard code was done, start to work on client file. First was created index.html for the login page, chat.html for the chatpage. Add some css. Client js file is logic.js. 

On server.js start to test socket.on("connection") and socket.on("disconnect") whether works well. From client.js start to emit message in the input field to server.js, server.js received request from client will responde back to all client sides by using socket.broadcast.emit. Test is all good by sending each other messages. 

Second main step was queried the username and joinroom information by using URLSearchParams function, after fetched params from url and emit the information to server. Server will pushed the username and room together with socket.id, so socket adatper generate new id everytime someone login and join the room. Created io.to().emit broacast all the messages back to the current users with the room they are in. Room and nickname all done, moving to Fetch external API get some free images from Pixabay, and when typing messages, if type "/" will give 2 options which fetched the 2 images which name "/gif" and "/emoji". People can have 2 options to send their images by a command line. 

The last step was if someone left, others will receive notification message in their window. 

All the studies learned the connections interation between client and server. All the method used is simple way, understand the basic foundation first then can go deeper.
