import WebSocket from "ws";
import { INIT_GAME, MOVE } from "../message";
import { Games } from "./game";


export class GameManager{
    // defined property
    private users : WebSocket[]
    private pendingUser: WebSocket|null;
    private games : Games[];
    
    constructor(){
        // all property must be used inside constructor to give initial values.
        this.games = []
        this.pendingUser = null;
        this.users = []
    }

    addUser(socket : WebSocket){
        this.users.push(socket)
        // handler ko data -> user
        this.addhandler(socket)
    }

    deleteUser(socket : WebSocket){
        this.users = this.users.filter((user)=> user !== socket)
    }

    private addhandler(socket : WebSocket){
        socket.on('message',(data)=>{
            try {
                const message = JSON.parse(data.toString())
                if (message.type === INIT_GAME) {
                    
                    if (this.pendingUser) {
                        // start the game
                        // pendingUser = player1 (white)
                        // new user = socket = player2 (black)
                        const game = new Games(this.pendingUser,socket)
                        this.games.push(game)
                        this.pendingUser = null
                    }    else{
                        // First player - assign white color and make them wait
                        this.pendingUser = socket
                        socket.send(JSON.stringify({
                            type: INIT_GAME,
                            payload: {
                                color: "white",
                                status: "waiting"
                            }
                        }))
                    }
                }
                if(message.type === MOVE){
                    const game = this.games.find(game => game.player1=== socket || game.player2 === socket)
                    if (game) {
                        game.makeMove(socket,message.move)
                    }
                }
            } catch (error) {
                console.error('Invalid JSON received:', error);
                return;
            }
        })
    }
}