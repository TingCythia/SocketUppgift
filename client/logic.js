const socket = io("http://localhost:3001")

var form = document.getElementById("chat-form");
var input = document.getElementById("msg");

// Message from server
socket.on('message', message=> {
    console.log(message);
    outputMessage(message);

  });

form.addEventListener('submit', function(e){
    e.preventDefault();
    const message =input.value;
        console.log(message)
        outputMessage(`User: ${message}`)
        socket.emit('chatMessages', message);
        input.value = '';

})


function outputMessage(message) {

    const div = document.createElement('div');
    div.classList.add('message');
/*     const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    div.appendChild(p); */
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message;
    div.appendChild(para);
    document.querySelector('.chat-messages').append(div);

  }