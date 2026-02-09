import Link from "next/link";
import { Button } from "./components/buttons/button";
import { StartButton } from "./components/buttons/startgame";

export default function Home() {
  const className = `bg-gray-800 text-gray-300 w-54 h-10 rounded-md my-4  self-center hover:shadow-sm font-sans p-2 border-2 border-gray-800 
        focus:border-transparent 
          focus:ring-2 focus:ring-offset-3 focus:ring-offset-gray-900
          focus:ring-gray-600 focus:outline-none`
  return (
    <>
      <div className="flex ">
        <img src={"./chessboard.png"} className="w-125 h-105 mr-8" />
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300 text-4xl mb-3 mt-3">Start your chess journey on the best platform!</p>
          {/* auth options */}
          <input type="text" placeholder="Username" className={className} />
          {/* button */}
          <StartButton />
        </div>
      </div>
    </>
  );
}
