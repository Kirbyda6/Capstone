const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('User connected...');
});

app.listen(8081, () => {
    console.log('Listening on port 8081...');
});