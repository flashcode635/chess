"use client"
import { Color, PieceSymbol, Square, type Square as ChessSquare } from "chess.js";
import { useState } from "react";
import { MOVE } from "../game/page";

export default function ChessBoard({board,socket}:{
    board:( {
                square: Square;
                type: PieceSymbol;
                color: Color;
            } | null
        )[][]; // 2d- array

    socket: WebSocket
    },
){
    const [from,setFrom] = useState<null| Square>(null);
    const [to,setTo] = useState<null| Square>(null);
const squareCopy:ChessSquare[][] = [];
console.log("square is here :-");
console.log(squareCopy);

    return(
        <>
            <div className="w-120 h-120 bg-blue-400 text-slate-900  ">
                {
                    board.map((row,i)=>{
                        return <div key={i} className="flex " >
                            {
                                row.map((square,j)=>(
                                    <div  key={j} 
                                        className={`w-16 h-16 flex justify-center items-center text-center ${(i+j)%2===0 ? 'bg-green-500': 'bg-green-100' }`} 
                                            onClick={()=>{
                                            if (!from) {
                                                setFrom(square?.square ?? null)
                                            }else{
                                                console.log(square?.square)
                                                setTo(square?.square ?? null);
                                                socket.send(JSON.stringify({
                                                    type: MOVE,
                                                    payload:{
                                                        from,
                                                        to
                                                    }
                                                }))
                                            }
                                            console.log(from+" "+ square?.square);
                                        
                                        }}> 
                                            {square ? square.type : ""}
                                            <br/>
                                            {square?.square ?? "w"}
                                    </div>
                                ))
                            } 

                        </div>
                    })
                }
            </div>   
        </>
    )
}