"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { MemberRole } from "@/features/members/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { useConfirm } from "@/hooks/use-confirm";

import { useDeleteMember } from "../api/use-delete-member";
import { useUpdateMember } from "../api/use-update-member";
import { MemberListSkeleton } from "./member-list-skeleton";
import { useWorkspaceId } from "../../workspaces/hooks/use-workspace-id";


export const MembersList = () => {

    const workspaceId = useWorkspaceId();

    const [ConfirmDialog, confirm] = useConfirm({
        title: "Remove Member",
        message: "This member will be removed from the workspace.",
        variant: "destructive"
    })

    const { data: members } = useGetMembers({ workspaceId });
    const { mutate: DeleteMember, isPending: isDeletingMember } = useDeleteMember();
    const { mutate: UpdateMember, isPending: isUpdatingMember } = useUpdateMember();

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();

        if (!ok) return;

        DeleteMember({
            param: { memberId }
        }, {
            onSuccess: () => {
                window.location.reload();
            }
        })
    }

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        UpdateMember({
            json: { role },
            param: { memberId }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button variant="secondary" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                {members?.documents.map((member, index) => {
                    return (
                        <Fragment key={index}>
                            {
                                (isUpdatingMember || isDeletingMember)
                                    ? (
                                        <MemberListSkeleton />
                                    )
                                    : (
                                        <div className="flex items-center gap-2">
                                            <MemberAvatar
                                                name={member.name}
                                                className="size-10"
                                                fallBackClassName="text-lg"
                                            />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-x-2">
                                                    <p className="text-sm font-medium">{member.name}</p>
                                                    <Badge variant="outline" className="h-4 text-[10px] flex items-center justify-center">
                                                        {member.role.toLowerCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button className="ml-auto" variant="secondary" size="icon">
                                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="bottom" align="end">
                                                    <DropdownMenuItem
                                                        className="font-medium cursor-pointer"
                                                        onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                                        disabled={isUpdatingMember}
                                                    >
                                                        Set as Administrator
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="font-medium cursor-pointer"
                                                        onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                                                        disabled={isUpdatingMember}
                                                    >
                                                        Set as Member
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="font-medium text-amber-700 cursor-pointer"
                                                        onClick={() => handleDeleteMember(member.$id)}
                                                        disabled={isDeletingMember}
                                                    >
                                                        Remove {member.name}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )
                                }
                            {index < members.documents.length - 1 && (
                                <Separator className="my-2.5" />
                            )}
                        </Fragment>
                    )
                })}
            </CardContent>
        </Card>
    )
}