"use client";
import { Color, PieceSymbol, Square } from "chess.js";
import { useMemo, useState } from "react";
import { MOVE } from "../game/page";

type PlayerColor = "white" | "black";

interface LastMove {
    from: string;
    to: string;
    promotion?: string;
}

interface ChessBoardProps {
    chess: any;
    setBoard: (board: any) => void;
    board: (
        | {
            square: Square;
            type: PieceSymbol;
            color: Color;
        }
        | null
    )[][];
    socket: WebSocket;
    playerColor: PlayerColor | null;
    currentTurn: PlayerColor;
    isMyTurn: boolean;
    lastMove: LastMove | null;
    inCheckColor: PlayerColor | null;
    onOutOfTurn: () => void;
}

export default function ChessBoard({
    board,
    socket,
    chess,
    playerColor,
    currentTurn,
    isMyTurn,
    lastMove,
    inCheckColor,
    onOutOfTurn,
}: ChessBoardProps) {
    const [from, setFrom] = useState<null | Square>(null);
    const [legalTargets, setLegalTargets] = useState<Square[]>([]);

    const isWhitePerspective = playerColor !== "black";

    const files = isWhitePerspective
        ? ["a", "b", "c", "d", "e", "f", "g", "h"]
        : ["h", "g", "f", "e", "d", "c", "b", "a"];
    const ranks = isWhitePerspective
        ? [8, 7, 6, 5, 4, 3, 2, 1]
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const orientedBoard = useMemo(
        () =>
            isWhitePerspective
                ? board
                : [...board].map((row) => [...row].reverse()).reverse(),
        [board, isWhitePerspective]
    );

    const handleSquareClick = (squareData: any, i: number, j: number) => {
        const squareName = `${files[j]}${ranks[i]}` as Square;

        // Only allow interaction when it's this player's turn
        if (!isMyTurn) {
            onOutOfTurn();
            return;
        }

        const pieceColor = squareData?.color as Color | undefined;
        const myPieceColor: Color | undefined =
            playerColor === "white" ? "w" : playerColor === "black" ? "b" : undefined;

        if (!from) {
            // First click - select a piece (only your own)
            if (!squareData || !myPieceColor || pieceColor !== myPieceColor) {
                return;
            }

            setFrom(squareName);

            try {
                const moves = chess.moves({ square: squareName, verbose: true }) as {
                    to: Square;
                }[];
                setLegalTargets(moves.map((m) => m.to));
            } catch {
                setLegalTargets([]);
            }
            return;
        }

        // Clicking the same square unselects
        if (from === squareName) {
            setFrom(null);
            setLegalTargets([]);
            return;
        }

        // If clicking another of your own pieces, change selection
        if (squareData && myPieceColor && pieceColor === myPieceColor) {
            setFrom(squareName);
            try {
                const moves = chess.moves({ square: squareName, verbose: true }) as {
                    to: Square;
                }[];
                setLegalTargets(moves.map((m) => m.to));
            } catch {
                setLegalTargets([]);
            }
            return;
        }

        // Only allow moving to a legal target square
        if (!legalTargets.includes(squareName)) {
            setFrom(null);
            setLegalTargets([]);
            return;
        }

        // Second click - attempt move to a legal target
        socket.send(
            JSON.stringify({
                type: MOVE,
                payload: {
                    move: {
                        from,
                        to: squareName,
                    },
                },
            })
        );

        setFrom(null);
        setLegalTargets([]);
    };

    const isSquareHighlighted = (squareName: Square) =>
        legalTargets.includes(squareName);

    const isLastMoveSquare = (squareName: Square) =>
        lastMove && (lastMove.from === squareName || lastMove.to === squareName);

    return (
        <>
            <div className="w-120 h-124 bg-transparent text-slate-900 rounded-lg p-1">
                {orientedBoard.map((row: any, i: number) => {
                    return (
                        <div key={i} className="flex">
                            {row.map((square: any, j: number) => {
                                const squareName = `${files[j]}${ranks[i]}` as Square;
                                const baseColor =
                                    (i + j) % 2 === 0 ? "bg-green-500" : "bg-green-100";

                                const isSelected = from === squareName;
                                const highlightMove = isSquareHighlighted(squareName);
                                const lastMoveHighlight = isLastMoveSquare(squareName);

                                const isOwnPiece =
                                    square &&
                                    playerColor &&
                                    ((playerColor === "white" && square.color === "w") ||
                                        (playerColor === "black" && square.color === "b"));

                                const canInteract = isMyTurn && isOwnPiece;

                                const kingInCheckHighlight =
                                    inCheckColor &&
                                    square &&
                                    square.type === "k" &&
                                    ((inCheckColor === "white" && square.color === "w") ||
                                        (inCheckColor === "black" && square.color === "b"));

                                const classes = [
                                    "w-16 h-16 flex justify-center items-center text-center transition-colors duration-150",
                                    baseColor,
                                    isSelected ? "ring-4 ring-yellow-400" : "",
                                    highlightMove ? "bg-emerald-300/60" : "",
                                    lastMoveHighlight ? "bg-yellow-300/60" : "",
                                    kingInCheckHighlight ? "ring-4 ring-red-500" : "",
                                    canInteract
                                        ? "cursor-pointer hover:brightness-110"
                                        : "cursor-not-allowed opacity-90",
                                ].join(" ");

                                return (
                                    <div
                                        key={j}
                                        className={classes}
                                        onClick={() => handleSquareClick(square, i, j)}
                                    >
                                        {square ? (
                                            <img
                                                src={`./Chess_${square?.type}${square?.color === "b" ? "d" : "l"
                                                    }t60.png`}
                                                className={`w-14 h-14 select-none transition-transform duration-150 ${canInteract ? "active:scale-95" : ""
                                                    }`}
                                                draggable={false}
                                            />
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </>
    );
}