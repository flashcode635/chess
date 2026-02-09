import { Color, PieceSymbol, Square } from "chess.js";

export default function ChessBoard({board}:{
    board:({
            square: Square;
            type: PieceSymbol;
            color: Color;
        } | null)[][]; // 2d- array
    }){
    return(
        <>
            <div className="w-120 h-120 bg-blue-400 grid grid-cols-8 grid-rows-8 border ">
                {
                    board.map((row,i)=>{
                        return <div key={i} className="flex">
                            {
                                row.map((square,j)=>(
                                    <div key={j} className={`w-8 h-8 ${(i+j)%2===0 ? 'bg-green-500': 'bg-green-100' }`} > 
                                         {square ? square.type : ""}
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