import { WebSocketServer } from "ws";
import { GameManager } from "./classes/gameManager";

const wss = new WebSocketServer({port:8000})
const gameManager = new GameManager()

wss.on('connection', function connection(ws){
    console.log('New WebSocket connection established');
    ws.on('error', console.error)  
    
    // Add user immediately when connection is established
    gameManager.addUser(ws)
    
    // Send welcome message to client
    ws.send(JSON.stringify({
        type: 'connection',
        payload: {
            message: 'Connected to chess server successfully!'
        }
    }))
    
    // Use correct event name
    ws.on("close", (code, reason) => {
        console.log(`WebSocket closed: ${code} - ${reason}`);
        gameManager.deleteUser(ws)
    })
})