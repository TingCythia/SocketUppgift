
const socket = io("http://localhost:3001")


socket.on("connect", () => {
const body = document.getElementById("body")
body.innerHTML = "New socket connected with id: " + socket.id;
})

