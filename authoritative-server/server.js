const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let corsOptions = {
    origin: true
};

const players = {};

io.on('connection', (socket) => {
    console.log(`User connected - id: ${socket.id}`);

    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', () => {
        console.log(`User disconnected - id: ${socket.id}`);

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

app.use(cors(corsOptions));

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
