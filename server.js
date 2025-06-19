const express = require('express');
const path = require("path");
const socket = require('socket.io');

const app = express();

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

const server = app.listen(8000, () => {
  console.log('Server is running on Port:', 8000)
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);
  socket.on('message', (message) => {
    console.log('Oh, I\'ve got something from ' + socket.id);
    messages.push(message);
    socket.broadcast.emit('message', message);
  });
  socket.on('login', (login) => {
    console.log('User logged in with id: ' + socket.id);
    users.push({ name: login, id: socket.id });
    socket.broadcast.emit('message', {
      author: 'Chat Bot',
      content: `<i>${login} has joined the conversation!</i>`
    });
  });
  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
    const usersArrayIndex = users.findIndex((i) => {
      return i.id === socket.id;
    })
    socket.broadcast.emit('message', {
      author: 'Chat Bot',
      content: `<i>${users[usersArrayIndex].name} has left the conversation... :(</i>`
    });
    users.splice(usersArrayIndex, 1);
  });
  console.log('I\'ve added a listener on message and disconnect events \n');
});