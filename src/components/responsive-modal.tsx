import { useMedia } from "react-use";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = ({ children, open, onOpenChange }: ResponsiveModalProps) => {

    const isDesktop = useMedia("(min-width: 1024px)", true);

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        Create Workspace
                    </DialogTitle>
                </DialogHeader>
                <DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
                    {children}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerHeader className="sr-only">
                <DrawerTitle>
                    Create Workspace
                </DrawerTitle>
            </DrawerHeader>
            <DrawerContent>
                <div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
