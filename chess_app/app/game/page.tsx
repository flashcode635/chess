"use client";
import ChessBoard from "../components/chessboard";
import { Button } from "../components/buttons/button";
import PlayIcon from "../svg/play";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { useSocket } from "../hooks/usesocket";

export const MOVE = "move";
export const INIT_GAME = "init_game";
export const GAME_OVER = "game_over";
export const STATE_UPDATE = "state_update";

type PlayerColor = "white" | "black";

interface LastMove {
    from: string;
    to: string;
    promotion?: string;
}

export default function Game() {
    const socket = useSocket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);

    const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
    const [currentTurn, setCurrentTurn] = useState<PlayerColor>("white");
    const [statusMessage, setStatusMessage] = useState<string>(
        "Waiting to start"
    );
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [lastMove, setLastMove] = useState<LastMove | null>(null);
    const [inCheckColor, setInCheckColor] = useState<PlayerColor | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [gameOverInfo, setGameOverInfo] = useState<{
        winner?: string;
        result?: string;
    } | null>(null);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("WS message:", message);

            switch (message.type) {
                case "connection": {
                    // initial handshake from server
                    break;
                }
                case INIT_GAME: {
                    const { color, status, message: serverMessage, state } =
                        message.payload || {};

                    if (state?.fen) {
                        chess.load(state.fen);
                        setBoard(chess.board());

                        const turnColor: PlayerColor =
                            state.turn === "w" ? "white" : "black";
                        setCurrentTurn(turnColor);
                        setInCheckColor(state.inCheck ? turnColor : null);
                    }

                    if (color === "white" || color === "black") {
                        setPlayerColor(color);
                    }

                    setStatusMessage(serverMessage || status || "Game initialized");
                    setStarted(true);

                    if (color && state?.turn) {
                        const myTurn =
                            (state.turn === "w" && color === "white") ||
                            (state.turn === "b" && color === "black");
                        setIsMyTurn(myTurn);
                    }
                    break;
                }
                case STATE_UPDATE: {
                    const state = message.payload;
                    if (!state?.fen) break;

                    chess.load(state.fen);
                    setBoard(chess.board());

                    const turnColor: PlayerColor =
                        state.turn === "w" ? "white" : "black";
                    setCurrentTurn(turnColor);

                    if (playerColor) {
                        setIsMyTurn(playerColor === turnColor);
                    }

                    setLastMove(state.lastMove || null);
                    setInCheckColor(state.inCheck ? turnColor : null);
                    setStatusMessage(
                        state.isGameOver
                            ? "Game over"
                            : playerColor && turnColor === playerColor
                                ? "Your move"
                                : "Opponent's move"
                    );
                    break;
                }
                case GAME_OVER: {
                    const { winner, result } = message.payload || {};
                    let msg = "Game over.";
                    if (winner) {
                        msg += ` Winner: ${winner}.`;
                    }
                    if (result) {
                        msg += ` Result: ${result}.`;
                    }
                    setStatusMessage(msg);
                    setIsMyTurn(false);
                    setGameOverInfo({ winner, result });
                    break;
                }
                default:
                    break;
            }
        };
    }, [socket, chess, playerColor]);

    const showTurnToast = () => {
        const msg =
            currentTurn === "white" ? "It’s White’s turn" : "It’s Black’s turn";
        setToast(msg);
        setTimeout(() => setToast(null), 1500);
    };

    if (!socket) {
        return <div>Connecting ...</div>;
    }

    const opponentColor: PlayerColor =
        playerColor === "white" ? "black" : "white";

    const renderPlayerRow = (
        label: string,
        color: PlayerColor,
        isActive: boolean,
        extraStatus?: string
    ) => (
        <div
            className={`flex items-center justify-between rounded-md px-3 py-2 mb-2 border ${isActive
                ? "border-emerald-400 bg-gray-800"
                : "border-gray-700 bg-gray-900"
                }`}
        >
            <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                    {label}
                </span>
                <span className="text-sm font-semibold capitalize">
                    {color} {isActive ? "(turn)" : ""}
                </span>
                {extraStatus && (
                    <span className="text-xs text-gray-400 mt-0.5">{extraStatus}</span>
                )}
            </div>
            {isActive && (
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
        </div>
    );

    return (
        <>
            <div className="flex justify-center items-center h-screen gap-10">
                <ChessBoard
                    chess={chess}
                    setBoard={setBoard}
                    socket={socket}
                    board={board}
                    playerColor={playerColor}
                    currentTurn={currentTurn}
                    isMyTurn={isMyTurn}
                    lastMove={lastMove}
                    inCheckColor={inCheckColor}
                    onOutOfTurn={showTurnToast}
                />

                <div className="flex flex-col gap-4 min-w-[240px]">
                    <div className="rounded-lg bg-gray-900/80 p-3 shadow-lg">
                        {renderPlayerRow(
                            "Top",
                            opponentColor,
                            currentTurn !== playerColor,
                            inCheckColor === opponentColor
                                ? "In check"
                                : playerColor
                                    ? currentTurn !== playerColor
                                        ? "Waiting for opponent"
                                        : ""
                                    : "Waiting for game"
                        )}

                        {renderPlayerRow(
                            "Bottom (You)",
                            playerColor || "white",
                            currentTurn === playerColor,
                            inCheckColor === playerColor
                                ? "You are in check"
                                : statusMessage
                        )}
                    </div>

                    <div>
                        {!started && (
                            <Button
                                types="primary"
                                before={<PlayIcon />}
                                size="md"
                                onClick={() => {
                                    socket.send(
                                        JSON.stringify({
                                            type: INIT_GAME,
                                        })
                                    );
                                }}
                            >
                                Play Game
                            </Button>
                        )}
                    </div>

                    {toast && (
                        <div className="mt-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 shadow-md border border-gray-700">
                            {toast}
                        </div>
                    )}
                </div>
            </div>

            {gameOverInfo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl px-6 py-5 border border-gray-700 max-w-sm w-full mx-4">
                        <h2 className="text-xl font-semibold mb-2 text-center">
                            Game Over
                        </h2>
                        <p className="text-center mb-1">
                            {gameOverInfo.winner
                                ? `${gameOverInfo.winner.toString().toUpperCase()} wins`
                                : "Draw"}
                        </p>
                        {gameOverInfo.result && (
                            <p className="text-center text-sm text-gray-300 mb-4">
                                {gameOverInfo.result === "checkmate"
                                    ? "Checkmate"
                                    : gameOverInfo.result === "stalemate"
                                        ? "Stalemate"
                                        : gameOverInfo.result}
                            </p>
                        )}
                        <button
                            className="mt-2 w-full rounded-md bg-emerald-500 hover:bg-emerald-400 text-sm font-medium py-2 transition-colors"
                            onClick={() => setGameOverInfo(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}