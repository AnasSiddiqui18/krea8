import { Button } from "@repo/ui/components/button"
import { authClient } from "@/lib/auth-client"
import { redirect, useRouter } from "next/navigation"
import { Spinner } from "@heroui/react"
import { ProfileDropdown } from "./profile-dropdown"

export function Header() {
    const session = authClient.useSession()
    const router = useRouter()

    const handleLogout = async () => {
        await authClient.signOut()
        router.refresh()
    }

    return (
        <div className="border-b border-secondary h-16 bg-white/70">
            <div className="container flex h-full items-center justify-between">
                <h2 className="text-2xl font-bold text-primary-dark">Krea8 🚀</h2>

                <div className="flex items-center gap-3">
                    {!session.data && !session.isPending ? (
                        <>
                            <Button variant="outline" onClick={() => redirect("/auth/signin")}>
                                Sign In
                            </Button>
                            <Button onClick={() => redirect("/auth/signup")}>Sign Up</Button>
                        </>
                    ) : session.isPending ? (
                        <Spinner size="md" />
                    ) : (
                        session.data && <ProfileDropdown session={{ user: session.data.user, logout: handleLogout }} />
                    )}
                </div>
            </div>
        </div>
    )
}
