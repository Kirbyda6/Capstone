export class Player {
    constructor(id, username, jwt) {
        this.id = id;
        this.username = username;
        this.jwt = jwt;
    }

    changeName(player, username) {
        return fetch(`http://localhost:9000/player/${player.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + player.jwt
            },
            body: JSON.stringify({
                username: username
            })
        }).then((response) => {
            return response.json()
        })
    }

    getPlayer(player) {
        return fetch(`http://localhost:9000/player/${player.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + player.jwt
            }
        }).then((response) => {
            return response.json()
        })
    }

    updateHealth(player) {
        return fetch(`http://localhost:9000/player/${player.id}/health`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + player.jwt
            }
        }).then((response) => {
            return response.json()
        })
    }

    updateShields(player) {
        return fetch(`http://localhost:9000/player/${player.id}/shields`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + player.jwt
            }
        }).then((response) => {
            return response.json()
        })
    }

    updateSpeed(player) {
        return fetch(`http://localhost:9000/player/${player.id}/speed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + player.jwt
            }
        }).then((response) => {
            return response.json()
        })
    }
}
