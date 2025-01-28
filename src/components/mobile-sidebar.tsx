"use client";

import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { Sidebar } from "./sidebar";

export const MobileSidebar = () => {

    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="secondary" className="lg:hidden">
                    <MenuIcon className="size-4 text-neutral-500" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Logo</SheetTitle>
                    <SheetDescription className="text-muted-foreground text-sm">
                        Logo
                    </SheetDescription>
                </SheetHeader>
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}