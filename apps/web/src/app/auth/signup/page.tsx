"use client"

import { Input } from "@repo/ui/components/input"
import { FormControl, FormLabel, FormItem, FormMessage, FormField, Form } from "@repo/ui/components/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@repo/ui/components/button"
import z from "zod"
import { useMutation } from "@tanstack/react-query"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert"
import { authClient } from "@/lib/auth-client"
import { signUpValidation } from "@/schema/auth"
import Link from "next/link"

export default function SignUpPage() {
    const form = useForm({
        resolver: zodResolver(signUpValidation),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    const {
        mutate: signUp,
        error,
        isPending,
    } = useMutation({
        mutationKey: ["signup_user"],
        mutationFn: async (e: z.output<typeof signUpValidation>) => {
            const response = await authClient.signUp.email({ ...e })
            if (response.error) throw new Error(response.error.message)
            return response.data
        },
        onSuccess() {
            window.location.href = "/auth/signin"
        },
    })

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-blue-300/50 via-white to-pink-200/50 px-4">
            <div className="h-auto w-sm rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-md max-sm:px-4">
                <div className="mt-5 flex flex-col gap-2 text-center">
                    <p className="mt-1 text-base text-gray-500">Welcome to krea8 🚀.</p>
                    <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sign Up</h3>
                </div>

                <Form {...form}>
                    <form className="mt-6 flex flex-col gap-4" onSubmit={form.handleSubmit((e) => signUp(e))}>
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>Name</FormLabel>
                                        {/* <Spinner /> */}
                                        <FormControl>
                                            <Input
                                                autoComplete="username"
                                                placeholder="john"
                                                {...field}
                                                className="border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-100 placeholder:max-sm:text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="max-sm:text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="username"
                                                placeholder="john@gmail.com"
                                                {...field}
                                                className="border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-100 placeholder:max-sm:text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="max-sm:text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                autoComplete="current-password"
                                                type="password"
                                                placeholder="******"
                                                {...field}
                                                className="border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring focus:ring-blue-100 placeholder:max-sm:text-xs"
                                            />
                                        </FormControl>
                                        <FormMessage className="max-sm:text-xs" />
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Sign up failed</AlertTitle>
                                    <AlertDescription>{error.message}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Button
                            disabled={isPending}
                            className="mt-2 py-2 font-semibold text-white shadow-md transition-all max-sm:text-xs"
                        >
                            {isPending ? <Loader2Icon className="animate-spin" /> : "Sign Up"}
                        </Button>

                        <p className="text-sm text-center">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-xs text-primary">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </Form>
            </div>
        </div>
    )
}
