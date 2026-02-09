import { Color, PieceSymbol, Square } from "chess.js";

export default function ChessBoard({board}:{
    board:({
            square: Square;
            type: PieceSymbol;
            color: Color;
        } | null)[][];
    }){
    return(
        <>
            <div className="w-120 h-120 bg-blue-400 grid grid-cols-8 grid-rows-8 border ">
                
            </div>   
        </>
    )
}