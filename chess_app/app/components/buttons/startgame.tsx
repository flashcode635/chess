"use client";

import { Button } from "./button";
import Link from "next/link";
import { useState } from "react";

export const StartButton =()=>{
    const [load, setLoad] = useState(false);

    return (
            <Button disabled={load} onClick={() => setLoad(true)}>
                <Link href="/game">Start Game </Link>
            </Button>
        )
}
   


