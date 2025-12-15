"use client"

import { Header } from "../shared/header"
import { Hero } from "../shared/hero"

export function Landing() {
    return (
        <div className="h-full relative bg-linear-to-br from-blue-300/50 via-white to-pink-200/50">
            <Header />
            <Hero />
        </div>
    )
}
