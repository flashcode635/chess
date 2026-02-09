"use client"
import ChessBoard from "../components/chessboard";
import { Button } from "../components/buttons/button";
import PlayIcon from "../svg/play";
import { useSocket } from "../hooks/usesocket";
import { useEffect, useState } from "react";
import { Chess } from "chess.js";


export const MOVE=  "move"
export const INIT_GAME=  "init_game"
export const GAME_OVER=  "game over"

export default function Game(){
    const socket = useSocket();
    console.log("Socket:", socket);
    const [chess,setChess] = useState(new Chess());
    const [board, setBoard]= useState(chess.board())
    useEffect(() => {
        if (!socket) {
            console.log("Socket not connected");
            return;
        }
        socket.onmessage = (event:any) => {
            const message = JSON.parse(event.data);
           console.log(message);

           switch (message.type) {
            case INIT_GAME:
                console.log("Game initialized");
                setChess(new Chess());
                setBoard(chess.board());
                break;
           case MOVE:
                console.log("Move received");
                const move= message.payload;
                chess.move(move);
                setBoard(chess.board());
                break;
           case GAME_OVER:
                console.log("Game over");
                break;
         
           }
           
        };
        console.log("Socket connected");
    }, [socket]);

    if (!socket) {
        return <div>Connecting to server...</div>;
    }
    return(
        <>
            <div className="flex justify-center items-center h-screen gap-10">
                <ChessBoard board={board}/> 
                <div className=" ">                
                    <Button types="primary" before={<PlayIcon/>} 
                    size="md" onClick={()=>{
                        socket.send(JSON.stringify({
                            type: INIT_GAME
                        }));
                    }
                        
                    }>
                        Play Game
                    </Button>
                </div>
                
            </div>
        </>
    )
}