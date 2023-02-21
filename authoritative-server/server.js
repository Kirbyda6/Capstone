const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const axios = require('axios');
const cors = require('cors');
var bodyParser = require('body-parser');
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require('jwks-rsa');
const Player = require('./models/playerModel');

const app = express();
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(bodyParser.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080"
    }
});

// Middleware to check if a valid JWT was supplied in the header
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://www.googleapis.com/oauth2/v3/certs`
    }),
  
    // Validate the audience and the issuer.
    issuer: 'https://accounts.google.com',
    algorithms: ['RS256']
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

const players = {};
const bullets = {};
let enemies = {};

app.get('/', (req, res) => {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    const params = {
        'response_type': 'code',
        'client_id': process.env.client_id,
        'redirect_uri': req.protocol + "://" + req.get("host")
        + req.baseUrl + '/oauth',
        'scope': 'profile email'
    }

    Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key])
    });

    res.redirect(url);
});

app.get('/oauth', (req, res) => {
    const body = {
        'code': req.query.code,
        'client_id': process.env.client_id,
        'client_secret': process.env.client_secret,
        'redirect_uri': req.protocol + "://" + req.get("host")
        + req.baseUrl + '/oauth',
        'grant_type': 'authorization_code'
    }

    axios.post('https://oauth2.googleapis.com/token', body)
    .then((token) => {
        axios.get('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses', {
            headers:{
                'Authorization': 'Bearer ' + token.data.access_token
            }
        }).then((user) => {
            const id = user.data.names[0].metadata.source.id;
            const name = user.data.names[0].unstructuredName;
            const email = user.data.emailAddresses[0].value;
            Player.getPlayer(id)
            .then((player) => {
                if (player) {
                    res.setHeader('Set-Cookie', [
                        `playerID=${player._id}; max-age=3600; SameSite=Strict`,
                        `username=${player.username}; max-age=3600; SameSite=Strict`,
                        `IDtoken=${token.data.id_token}; max-age=3600; SameSite=Strict`
                    ]).redirect('http://localhost:8080/');
                } else {
                    Player.addPlayer(id, name, email)
                    .then(() => {
                        res.setHeader('Set-Cookie', [
                            `playerID=${id}; max-age=3600; SameSite=Strict`,
                            `IDtoken=${token.data.id_token}; max-age=3600; SameSite=Strict`
                        ]).redirect('http://localhost:8080/');
                    });
                }
            });
        });
    });
});

app.post('/player/:id', checkJwt, (req, res) => {
    Player.getPlayer(req.params.id).then((player) => {
        if (player &&
            player.name === req.auth.name &&
            player.email === req.auth.email) {
            if (Player.updateName(req.params.id, req.body.username)) {
                res.json({username: req.body.username});
            } else {
                res.status(404).end();
            }
        }
    })
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code && err.code === 'credentials_required') {
        res.status(err.status).send({
            "Error": "No token was found"
        });
    } else if (err.code && err.code === 'invalid_token') {
        res.status(err.status).send({
            "Error": "The provided token is invalid - Try refreshing your token"
        });
    } else {
        res.send({
            "Error": err
        });
    }
});

function cleanup(spawnController) {
    if (!Object.keys(players).length) {
        enemies = {};
    }
    clearInterval(spawnController);
}

function getRandomPlayer() {
    let playerIds = Object.keys(players);
    let randIndex = Math.floor(Math.random() * playerIds.length);
    return players[playerIds[randIndex]];
}

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
        cleanup(spawnController);
    });

    socket.on('playerDied', (id) => {
        console.log(`User died: ${id}`);
        delete players[id];
        io.emit('playerDisconnecting', id);
        cleanup(spawnController);
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

    // enemy spawn controller
    let spawnController = setInterval(() => {
        const generateId = () => {
            const dateStr = Date.now().toString(36);
            const rand = Math.random().toString(36).substr(2);
            return dateStr + rand;
        };
        const enemyId = generateId();
        const enemyTarget = getRandomPlayer();
        const newEnemy = enemies[enemyId] = {
            enemyId: enemyId,
            x: Math.floor(Math.random() * 3100) + 50,
            y: Math.floor(Math.random() * 2300) + 50,
            target: {
                id: enemyTarget.playerId,
                x: enemyTarget.x,
                y: enemyTarget.y,
            }
        };
        io.emit('newEnemy', newEnemy);
    }, 5000);

    socket.on('updateEnemies', (enemyList) => {
        Object.keys(enemyList).forEach((id) => {
            enemies[id].x = enemyList[id].x;
            enemies[id].y = enemyList[id].y;
        })
        socket.emit('currentEnemies', enemies);
    })

    socket.emit('currentEnemies', enemies);

    socket.on('enemyDied', (id) => {
        delete enemies[id];
        io.emit('removeEnemy', id);
    });
});
