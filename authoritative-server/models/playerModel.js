const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();

mongoose.set('strictQuery', true);

const opts = {
    user: process.env.MONGO_USR,
    pass: process.env.MONGO_PASS,
    authSource: process.env.MONGO_AUTH_SRC
}

const conn = mongoose.connect(process.env.MONGO_URL, opts)
.then(() => {console.log('Connected to DB!')})
.catch(() => {console.log('Could not connect...')})

const playerSchema = new Schema({
    _id: Number,
    email: {type: String, default: ''},
    username: {type: String, default: ''},
    health: {type: Number, default: 3},
    sheilds: {type: Number, default: 3},
    speed: {type: Number, default: 3}
});

const Player = mongoose.model('Player', playerSchema);

function addPlayer(id) {
    const newPlayer = Player({_id: id});
    return newPlayer.save();
}

function getPlayer(id) {
    return Player.findById(id).exec();
}

module.exports = { addPlayer, getPlayer }