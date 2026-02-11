import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE, STATE_UPDATE } from "../message";

export interface SerializedGameState {
    fen: string;
    turn: "w" | "b";
    inCheck: boolean;
    isGameOver: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    lastMove?: {
        from: string;
        to: string;
        promotion?: string;
    };
}

export class Games {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    private timeStart: Date;
    private moveCount: number = 0;
    public players: WebSocket[];

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.timeStart = new Date();
        this.players = [this.player1, this.player2];

        // Send initial game state to both players
        const initialState = this.serializeState();

        // Player1 (white, starts)
        this.player1.send(
            JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "white",
                    status: "game_started",
                    message:
                        "Game started! You are playing as White. You move first.",
                    state: initialState,
                },
            })
        );

        // Player2 (black, waiting)
        this.player2.send(
            JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "black",
                    status: "game_started",
                    message:
                        "Game started! You are playing as Black. Waiting for White's move.",
                    state: initialState,
                },
            })
        );
    }

    private serializeState(lastMove?: { from: string; to: string; promotion?: string }): SerializedGameState {
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

    private getSocketColor(socket: WebSocket): "w" | "b" | null {
        if (socket === this.player1) return "w";
        if (socket === this.player2) return "b";
        return null;
    }

    makeMove(
        socket: WebSocket,
        move: {
            from: string;
            to: string;
            promotion?: string;
        }
    ) {
        const playerColor = this.getSocketColor(socket);

        // Strict turn enforcement
        if (!playerColor) {
            console.log("Unknown player attempted to move");
            return;
        }

        if (playerColor !== this.board.turn()) {
            console.log(
                `Out-of-turn move attempt by ${playerColor === "w" ? "white" : "black"}`
            );
            // Optionally, we could send a specific out-of-turn message here
            return;
        }

        try {
            const result = this.board.move(move);
            if (!result) {
                console.log("Illegal move attempted:", move);
                return;
            }
        } catch (e) {
            console.log("Invalid move:", e);
            return;
        }

        this.moveCount++;

        const state = this.serializeState(move);

        // Broadcast updated authoritative state to both players
        const stateMessage = JSON.stringify({
            type: STATE_UPDATE,
            payload: state,
        });

        this.player1.send(stateMessage);
        this.player2.send(stateMessage);

        // Notify game over with winner info if the game has ended
        if (state.isGameOver) {
            const winnerColor =
                this.board.turn() === "w"
                    ? "black" // if it's white's turn after move and game over, black delivered mate or caused stalemate
                    : "white";

            const resultType = state.isCheckmate
                ? "checkmate"
                : state.isStalemate
                    ? "stalemate"
                    : "game_over";

            const gameOverMessage = JSON.stringify({
                type: GAME_OVER,
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
