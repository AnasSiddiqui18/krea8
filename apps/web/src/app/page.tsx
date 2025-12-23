import { Hero } from "@/components/shared/hero"

export default function Home() {
    return (
        <div className="bg-background h-screen">
            <div className="h-full relative bg-linear-to-br from-blue-300/50 via-white to-pink-200/50">
                <Hero />
            </div>
        </div>
    )
}
