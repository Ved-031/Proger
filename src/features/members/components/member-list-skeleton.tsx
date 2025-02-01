import { Skeleton } from "@/components/ui/skeleton";

export const MemberListSkeleton = () => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-2 w-[50px]" />
                        <Skeleton className="h-2 w-[25px]" />
                    </div>
                    <Skeleton className="h-2 w-[80px]" />
                </div>
            </div>
            <div>
                <Skeleton className="w-8 h-[35px] rounded-md" />
            </div>
        </div>
    )
}