"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const message_1 = require("../message");
const game_1 = require("./game");
class GameManager {
    constructor() {
        // all property must be used inside constructor to give initial values.
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        // handler ko data -> user
        this.addhandler(socket);
    }
    deleteUser(socket) {
        this.users = this.users.filter((user) => user !== socket);
        // TODO: Clean up games / pending user if needed
    }
    addhandler(socket) {
        socket.on("message", (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.INIT_GAME) {
                    if (this.pendingUser) {
                        // start the game
                        // pendingUser = player1 (white)
                        // new user = socket = player2 (black)
                        const game = new game_1.Games(this.pendingUser, socket);
                        this.games.push(game);
                        this.pendingUser = null;
                    }
                    else {
                        // First player - assign white color and make them wait
                        this.pendingUser = socket;
                        socket.send(JSON.stringify({
                            type: message_1.INIT_GAME,
                            payload: {
                                color: "white",
                                status: "waiting",
                                message: "Waiting for an opponent to join...",
                            },
                        }));
                    }
                }
                if (message.type === message_1.MOVE) {
                    const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                    if (game) {
                        game.makeMove(socket, message.payload.move);
                    }
                }
            }
            catch (error) {
                console.error("Invalid JSON received:", error);
                return;
            }
        });
    }
}
exports.GameManager = GameManager;
