"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";


interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {

    const pathname = usePathname();
    const isSignIn = pathname === "/sign-in";

    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className="max-w-7xl mx-auto">
                <div className="mx-auto max-w-screen-2xl p-4">
                    <nav className="flex items-center justify-between">
                        <Link href="/">
                            <Image src='/logo.svg' alt="logo" width={152} height={56} />
                        </Link>
                        <Button asChild variant="secondary">
                            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                                {isSignIn ? "Sign Up" : "Login"}
                            </Link>
                        </Button>
                    </nav>
                    <div className="flex flex-col items-center justify-center pt-4 md:pt-7">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default AuthLayout;