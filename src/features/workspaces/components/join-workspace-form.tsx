"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useJoinWorkspace } from "../api/use-join-workspace";


interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    },
}

export const JoinWorkspaceForm = ({ initialValues }: JoinWorkspaceFormProps) => {

    const router = useRouter();
    const params = useParams();

    const code = params?.inviteCode as string;
    const workspaceId = useWorkspaceId();

    const { mutate, isPending } = useJoinWorkspace();

    const handleJoin = () => {
        mutate({
            json: { code },
            param: { workspaceId }
        }, {
            onSuccess: ({ data }) => {
                router.push(`/workspaces/${data.$id}`);
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{initialValues.name}</strong> workspace
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col md:flex-row items-center gap-y-2 justify-between">
                    <Button 
                        variant="secondary"
                        size="lg"
                        type="button"
                        className="w-full md:w-fit"
                        disabled={isPending}
                        asChild
                    >
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        className="w-full md:w-fit"
                        size="lg"
                        type="button"
                        disabled={isPending}
                        onClick={handleJoin}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}