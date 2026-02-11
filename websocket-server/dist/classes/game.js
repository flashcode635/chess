"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Games = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("../message");
class Games {
    constructor(player1, player2) {
        this.moveCount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.timeStart = new Date();
        this.players = [this.player1, this.player2];
        // Send initial game state to both players
        const initialState = this.serializeState();
        // Player1 (white, starts)
        this.player1.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "white",
                status: "game_started",
                message: "Game started! You are playing as White. You move first.",
                state: initialState,
            },
        }));
        // Player2 (black, waiting)
        this.player2.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "black",
                status: "game_started",
                message: "Game started! You are playing as Black. Waiting for White's move.",
                state: initialState,
            },
        }));
    }
    serializeState(lastMove) {
        return {
            fen: this.board.fen(),
            turn: this.board.turn(),
            inCheck: this.board.inCheck(),
            isGameOver: this.board.isGameOver(),
            isCheckmate: this.board.isCheckmate(),
            isStalemate: this.board.isStalemate(),
            lastMove,
        };
    }
    getSocketColor(socket) {
        if (socket === this.player1)
            return "w";
        if (socket === this.player2)
            return "b";
        return null;
    }
    makeMove(socket, move) {
        const playerColor = this.getSocketColor(socket);
        // Strict turn enforcement
        if (!playerColor) {
            console.log("Unknown player attempted to move");
            return;
        }
        if (playerColor !== this.board.turn()) {
            console.log(`Out-of-turn move attempt by ${playerColor === "w" ? "white" : "black"}`);
            // Optionally, we could send a specific out-of-turn message here
            return;
        }
        try {
            const result = this.board.move(move);
            if (!result) {
                console.log("Illegal move attempted:", move);
                return;
            }
        }
        catch (e) {
            console.log("Invalid move:", e);
            return;
        }
        this.moveCount++;
        const state = this.serializeState(move);
        // Broadcast updated authoritative state to both players
        const stateMessage = JSON.stringify({
            type: message_1.STATE_UPDATE,
            payload: state,
        });
        this.player1.send(stateMessage);
        this.player2.send(stateMessage);
        // Notify game over with winner info if the game has ended
        if (state.isGameOver) {
            const winnerColor = this.board.turn() === "w"
                ? "black" // if it's white's turn after move and game over, black delivered mate or caused stalemate
                : "white";
            const resultType = state.isCheckmate
                ? "checkmate"
                : state.isStalemate
                    ? "stalemate"
                    : "game_over";
            const gameOverMessage = JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner: winnerColor,
                    result: resultType,
                    fen: state.fen,
                },
            });
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);
        }
    }
}
exports.Games = Games;
