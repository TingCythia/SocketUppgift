const socket = io("http://localhost:3001")

var form = document.getElementById("chat-form");
var input = document.getElementById("msg");
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get userroom and name from URL
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const username= urlParams.get('username')
console.log(username);
let room = urlParams.get('room')
console.log(room);

// Join chatroom
socket.emit('joinRoom', {username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message',(message)=> {
    outputMessage( message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

//input value with command line
const search_terms = ['/gif', '/emoji'];
const res = document.getElementById("result");
function autocompleteMatch(input) {
  if (input == '') {
    return [];
  }
  var reg = new RegExp(input)
  return search_terms.filter(function(term) {
	  if (term.match(reg)) {
  	  return term;
	  }
  });
}
function showResults(val) {
  res.innerHTML = '';
  let list = '';
  let terms = autocompleteMatch(val);
  for (i=0; i<terms.length; i++) {
    list += '<li>' + terms[i] + '</li>';
  }
  res.innerHTML = '<ul>' + list + '</ul>';
}

res.onclick = function (event) {
  const setValue = event.target.innerText;
  input.value = setValue;
  this.innerHTML = "";
};
//end of input value with commandline

//send message event 
form.addEventListener('submit', function(e){
    e.preventDefault();
    const msg =input.value;
        socket.emit('chatMessages',msg);
        input.value = '';
})

socket.on('command', (gif)=>{
  chatMessages.innerHTML +=  `
  <h3>${gif.user}:</h3>
  <img src=${gif.url} width=130px height=130px> `;
}) 

function outputMessage(message) {

    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText =message.username;
    div.appendChild(p);  
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector('.chat-messages').append(div);

  }

  // Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}