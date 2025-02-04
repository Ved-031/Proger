import Image from "next/image";
import Link from "next/link";

import { UserButton } from "@/features/auth/components/user-button";

interface StandaloneLayoutProps {
    children: React.ReactNode;
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className="max-w-screen-2xl mx-auto p-4">
                <nav className="flex items-center justify-between h-[73px]">
                    <Link href="/">
                        <Image src='/logo.png' alt="logo" width={152} height={56} />
                    </Link>
                    <UserButton />
                </nav>
                <div className='flex flex-col items-center justify-center py-4'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default StandaloneLayout;