import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberAvatarProps {
    name: string;
    className?: string;
    fallBackClassName?: string;
}

export const MemberAvatar = ({ name, className, fallBackClassName }: MemberAvatarProps) => {
    return (
        <Avatar className={cn(
            "size-5 transition border border-neutral-300 rounded-full", 
            className
        )}>
            <AvatarFallback className={cn(
                "bg-neutral-100 font-medium text-neutral-500 flex items-center justify-center",
                fallBackClassName
            )}>
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}