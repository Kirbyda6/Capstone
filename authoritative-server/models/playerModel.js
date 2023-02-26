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
    .then(() => { console.log('Connected to DB!') })
    .catch(() => { console.log('Could not connect...') })

const playerSchema = new Schema({
    _id: Number,
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    health: { type: Number, default: 3 },
    shields: { type: Number, default: 3 },
    speed: { type: Number, default: 3 },
    currency: { type: Number, default: 0 },
});

const Player = mongoose.model('Player', playerSchema);

function addPlayer(id, name, email) {
    const newPlayer = Player({
        _id: id,
        name: name,
        email: email
    });
    return newPlayer.save();
}

function getPlayer(id) {
    return Player.findById(id).exec();
}

function updateName(id, name) {
    return Player.findByIdAndUpdate(id, { username: name }, (err, res) => {
        if (res) return true;
        return false;
    })
}

function updateCurrency(id, currency, score) {
    return Player.findByIdAndUpdate(id, { currency: currency + score }, (err, res) => {
        if (res) return true;
        return false;
    })
}

function updateHealth(id, health) {
    return Player.findByIdAndUpdate(id, { health: health }, (err, res) => {
        if (res) return true;
        return false;
    });
}

function updateShields(id, shields) {
    return Player.findByIdAndUpdate(id, { shields: shields }, (err, res) => {
        if (res) return true;
        return false;
    });
}

function updateSpeed(id, speed) {
    return Player.findByIdAndUpdate(id, { speed: speed }, (err, res) => {
        if (res) return true;
        return false;
    });
}

module.exports = { addPlayer, getPlayer, updateName, updateCurrency, updateHealth, updateShields, updateSpeed }
