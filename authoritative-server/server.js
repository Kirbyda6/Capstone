const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080"
    }
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

const players = {};
const bullets = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 3100) + 50,
        y: Math.floor(Math.random() * 2300) + 50,
        playerId: socket.id,
        health: 5,
        shield: 5,
    };

    socket.on('initialize', (upgradeInfo) => {
        players[socket.id].health += upgradeInfo.healthUpgrade;
        players[socket.id].shield += upgradeInfo.shieldUpgrade;
        socket.emit('initUi', players[socket.id]);
    });

    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        delete players[socket.id];

        io.emit('playerDisconnecting', socket.id);
    });

    socket.on('playerDied', (id) => {
        console.log(`User died: ${id}`);

        delete players[id];

        io.emit('playerDisconnecting', id);
    });

    socket.on('playerMovement', (data) => {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
        players[socket.id].rotation = data.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('fire', (ship) => {
        ship.playerId = socket.id;
        io.emit('fired', ship);
    });
});
