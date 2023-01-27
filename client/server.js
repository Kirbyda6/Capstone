const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
// const auServ = require('socket.io-client')('http://localhost:8081/')

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const players = {};

io.on('connection', (socket) => {
    console.log('User connected...');

    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id
    };

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', () => {
        console.log('User disconnected...');

        delete players[socket.id];

        io.emit('playerDisconnecting', socket.id);
    });

    socket.on('playerMovement', (data) => {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].rotation = data.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
});

server.listen(8080, () => {
    console.log('Listening on port 8080...');
});