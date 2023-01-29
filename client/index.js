const express = require('express');
const cors = require('cors');
const app = express();

let corsOptions = {
    origin: true
};

app.use(cors(corsOptions));

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/game', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
});

app.listen(8080, () => {
    console.log('Listening on port 8080...');
});
