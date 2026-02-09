import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "../message";

export class Games{
    public player1 : WebSocket;
    public player2 : WebSocket
    public board: Chess;
    private timeStart : Date;
   private moveCount : number = 0;
    public players: WebSocket[]

    constructor(player1 : WebSocket,player2 : WebSocket){
        this.player1 = player1
        this.player2 = player2
        this.board= new Chess();
        this.timeStart = new Date()
        this.players = [this.player1,this.player2]        
        // Send startgame  message to player1 (white)
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white",
                status: "game_started",
                message: "Game started! You are playing as White. You move first."
            }
        }))
        
        // Send  startgame message to player2 (black)
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black",
                status: "game_started",
                message: "Game started! You are playing as Black. Waiting for White's move."
            }
        }))
    }

    makeMove(socket:WebSocket , move:{
        from:string
        to: string
    }){
        try {
            // Validate move format (keeping this as requested)
            if (this.moveCount%2===0 && socket !== this.player1) {
                console.log('invalid move 1');
                return;
            }
            if (this.moveCount%2===1 && socket !== this.player2) {
                console.log('invalid move 2');
                return;
            }
            
            this.board.move(move)
        } catch (e) {
            console.log('Invalid move:', e);
            return;
        }
        
        // game over
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'player1' : 'player2'
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? 'player1' : 'player2'
                }
            }))
        }
        
        // Send move ONLY to the opponent (not both players)
        if (socket === this.player1) {
            // Player1 made the move, send to Player2
            console.log("Sending move to player2");
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        } else {
            // Player2 made the move, send to Player1
            console.log("Sending move to player1");
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }

        this.moveCount++

    }
}
